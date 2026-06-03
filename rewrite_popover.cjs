const fs = require('fs');

// 1. Modify CalendarPopover.jsx
let content = fs.readFileSync('src/components/CalendarPopover.jsx', 'utf8');

// Replace component name
content = content.replace(/const CalendarModal = /g, 'const CalendarPopover = ');
content = content.replace(/export default CalendarModal;/g, 'export default CalendarPopover;');

// Replace wrapper from fixed full-screen to an absolute popover
content = content.replace(
    /<div \n\s*className="fixed inset-0 z-\[2000\] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900\/10"\n\s*onClick=\{onClose\}\n\s*>/g,
    `<!-- replaced -->`
);

// We need to replace the outermost div.
// Let's just use string replacement on the exact return block.
content = content.replace(
    /return \(\n\s*<div \n\s*className="fixed inset-0 z-\[2000\] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900\/10"\n\s*onClick=\{onClose\}\n\s*>\n\s*<style>/g,
    `return (\n        <div \n            className="absolute top-full left-0 mt-2 z-[200]"\n        >\n            <style>`
);

content = content.replace(
    /onClick=\{\(e\) => e.stopPropagation\(\)\}/g,
    ``
);

// Wait, the end of the return statement has an extra </div>.
// We changed `<div className="fixed ...` to `<div className="absolute ...`. So the closing div matches perfectly.

// Also let's add a document click listener to close the popover when clicking outside.
const hookCode = `
    React.useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('.calendar-popover-container')) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);
`;
content = content.replace(
    /React\.useEffect\(\(\) => \{\n\s*if \(isOpen\) \{\n\s*setViewDate\(parseDate\(activeDate\)\);\n\s*\}\n\s*\}, \[isOpen, activeDate\]\);/g,
    `React.useEffect(() => {\n        if (isOpen) {\n            setViewDate(parseDate(activeDate));\n        }\n    }, [isOpen, activeDate]);\n${hookCode}`
);

// Add calendar-popover-container class
content = content.replace(
    /<div \n\s*className="absolute top-full left-0 mt-2 z-\[200\]"\n\s*>/g,
    `<div \n            className="absolute top-full left-0 mt-2 z-[200] calendar-popover-container"\n        >`
);

fs.writeFileSync('src/components/CalendarPopover.jsx', content);

// 2. Modify ReportTemplate.jsx
let reportContent = fs.readFileSync('src/components/ReportTemplate.jsx', 'utf8');
reportContent = reportContent.replace(
    /import CalendarModal from '.\/CalendarModal';/g,
    `import CalendarModal from './CalendarModal';\nimport CalendarPopover from './CalendarPopover';`
);

// We need to change the parent div of the "as of" input to relative
reportContent = reportContent.replace(
    /<div className="flex flex-col gap-1\.5 w-\[140px\]">/g,
    `<div className="flex flex-col gap-1.5 w-[140px] relative">`
);

// Then insert CalendarPopover right under the button
reportContent = reportContent.replace(
    /className="w-\[140px\] h-9 px-3 border border-gray-300 rounded-\[3px\] text-\[13px\] font-medium text-gray-800 outline-none focus:border-\[#0077c5\] bg-white cursor-pointer flex items-center justify-start text-left"\n\s*>\n\s*\{asOfDate\}\n\s*<\/button>\n\s*<\/div>/g,
    `className="w-[140px] h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] font-medium text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer flex items-center justify-start text-left"
                            >
                                {asOfDate}
                            </button>
                            <CalendarPopover 
                                isOpen={showCalendarModal} 
                                onClose={() => setShowCalendarModal(false)}
                                onDateSelect={(dateStr) => {
                                    const [yyyy, mm, dd] = dateStr.split('-');
                                    setAsOfDate(\`\${dd}/\${mm}/\${yyyy}\`);
                                }}
                                initialDate={asOfDate.split('/').reverse().join('-')}
                            />
                        </div>`
);

// Remove the old CalendarModal at the bottom
reportContent = reportContent.replace(
    /<CalendarModal \n\s*isOpen=\{showCalendarModal\} \n\s*onClose=\{\(\) => setShowCalendarModal\(false\)\}\n\s*onDateSelect=\{\(dateStr\) => \{\n\s*const \[yyyy, mm, dd\] = dateStr\.split\('-'\);\n\s*setAsOfDate\(\`\$\{dd\}\/\$\{mm\}\/\$\{yyyy\}\`\);\n\s*\}\}\n\s*initialDate=\{asOfDate\.split\('\/'\)\.reverse\(\)\.join\('-'\)\}\n\s*\/>/g,
    ``
);

fs.writeFileSync('src/components/ReportTemplate.jsx', reportContent);
