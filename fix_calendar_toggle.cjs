const fs = require('fs');

// Update CalendarPopover hook
let content = fs.readFileSync('src/components/CalendarPopover.jsx', 'utf8');
content = content.replace(
    /if \(!e\.target\.closest\('\.calendar-popover-container'\)\) \{/g,
    "if (!e.target.closest('.calendar-popover-container') && !e.target.closest('.calendar-toggle-btn')) {"
);
fs.writeFileSync('src/components/CalendarPopover.jsx', content);

// Update ReportTemplate button
let reportContent = fs.readFileSync('src/components/ReportTemplate.jsx', 'utf8');
reportContent = reportContent.replace(
    /onClick=\{\(\) => setShowCalendarModal\(true\)\}/g,
    "onClick={() => setShowCalendarModal(!showCalendarModal)}"
);
reportContent = reportContent.replace(
    /className="w-\[140px\] h-9 px-3 border border-gray-300 rounded-\[3px\] text-\[13px\] \n?font-medium text-gray-800 outline-none focus:border-\[#0077c5\] bg-white cursor-pointer flex items-center justify-start \n?text-left"/g,
    'className="calendar-toggle-btn w-[140px] h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] font-medium text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer flex items-center justify-start text-left"'
);
fs.writeFileSync('src/components/ReportTemplate.jsx', reportContent);
