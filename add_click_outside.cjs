const fs = require('fs');
let content = fs.readFileSync('src/components/CalendarPopover.jsx', 'utf8');

// Add calendar-popover-container class
content = content.replace(
    /className="relative w-\[260px\] bg-white border border-gray-200 shadow-\[0_4px_20px_rgb\(0,0,0,0\.15\)\] overflow-hidden calendar-animate font-sans"/g,
    'className="relative w-[260px] bg-white border border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.15)] overflow-hidden calendar-animate font-sans calendar-popover-container"'
);

// Add handleClickOutside
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

fs.writeFileSync('src/components/CalendarPopover.jsx', content);
