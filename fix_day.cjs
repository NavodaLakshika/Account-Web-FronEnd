const fs = require('fs');
let content = fs.readFileSync('src/components/CalendarPopover.jsx', 'utf8');

// I replaced all `{day}` with `{day.substring(0,2)}`.
// For the grid of numbers, it should be `{day}`.
// The grid of numbers uses `<button ... > {day.substring(0,2)} </button>`
// Let's replace `{day.substring(0,2)}` back to `{day}` inside the button.

content = content.replace(
    /active:scale-90\n\s*`\}\n\s*>\n\s*\{day\.substring\(0,2\)\}/g,
    "active:scale-90\n                                        `}\n                                    >\n                                        {day}"
);

// Wait, my previous replacement for the button styling was:
// className={\`w-9 h-9 flex items-center justify-center rounded-[4px] text-[13px] font-medium transition-all relative
//                                             \${isToday(day) ? 'bg-[#0077c5] text-white shadow-sm' : (idx % 7 === 0 || idx % 7 === 6) ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-800 hover:bg-gray-100'}
//                                         \`\}
// So there is NO `active:scale-90` anymore!

// Let's just do a safer replace for the button content.
// The button content looks like:
// >\n                                        {day.substring(0,2)}

content = content.replace(
    />\s*\{day\.substring\(0,2\)\}\s*<\/button>/g,
    ">\n                                        {day}\n                                    </button>"
);

// We must also handle the `isToday(day)` which might have been changed to `isToday(day.substring(0,2))`?
// No, I did `{day}` replacement globally!
// Let me just revert the {day.substring(0,2)} globally where it's used inside the map for days.
// Actually, `isToday(day)` was NOT `{day}`, it was `day`, so it wasn't affected by `{day}`.

fs.writeFileSync('src/components/CalendarPopover.jsx', content);
