const fs = require('fs');
let content = fs.readFileSync('src/components/ReportTemplate.jsx', 'utf8');

// 1. HEADER LOGIC
content = content.replace(
    /                    \{\/\* Report Header Text \*\/\}\n                    <div className="py-10 text-center flex flex-col gap-1 px-8">\n                        <h1 className="text-\[18px\] font-bold text-gray-900 uppercase tracking-wide">\{companyName\}<\/h1>\n                        <h2 className="text-\[14px\] text-gray-700 font-medium">\{title\}<\/h2>\n                        <h3 className="text-\[13px\] text-gray-500">\{subtitle\}<\/h3>\n                    <\/div>/g,
    `                    {/* Report Header Text */}
                    <div className={\`py-10 flex flex-col gap-1 px-8 \${
                        customizations.headerAlignment === 'Left' ? 'text-left items-start' : 
                        customizations.headerAlignment === 'Right' ? 'text-right items-end' : 'text-center items-center'
                    }\`}>
                        {customizations.showLogo && (
                            <img src="/onimta_logo-modified.png" alt="Company Logo" className="h-12 w-auto object-contain mb-2" />
                        )}
                        {customizations.headerLayout === 'companyFirst' ? (
                            <>
                                {customizations.showCompanyName && <h1 className="text-[18px] font-bold text-gray-900 uppercase tracking-wide">{companyName}</h1>}
                                <h2 className="text-[14px] text-gray-700 font-medium">{title}</h2>
                            </>
                        ) : (
                            <>
                                <h2 className="text-[18px] font-bold text-gray-900 tracking-wide">{title}</h2>
                                {customizations.showCompanyName && <h1 className="text-[14px] text-gray-700 font-medium uppercase">{companyName}</h1>}
                            </>
                        )}
                        {customizations.showReportPeriod && <h3 className="text-[13px] text-gray-500">{subtitle}</h3>}
                    </div>`
);

// 2. DATA FORMATTING LOGIC
content = content.replace(
    /    const defaultCustomizations = \{/g,
    `    const formatValue = (val) => {
        if (val === undefined || val === null || val === '') {
            return customizations.showEmptyAs === 'dash' ? '-' : '';
        }
        
        let numStr = String(val).replace(/[^0-9.-]/g, '');
        let num = parseFloat(numStr);
        
        if (isNaN(num) || numStr.length === 0 || typeof val === 'string' && !/[0-9]/.test(val)) {
            return val; 
        }
        
        if (customizations.divideBy1000) num = num / 1000;
        if (customizations.roundWholeNumber) num = Math.round(num);

        let formattedStr = Math.abs(num).toLocaleString('en-US', {
            minimumFractionDigits: customizations.roundWholeNumber ? 0 : 2,
            maximumFractionDigits: customizations.roundWholeNumber ? 0 : 2
        });

        if (!customizations.hideCurrency && String(val).includes('Rs.')) {
            formattedStr = 'Rs. ' + formattedStr;
        }

        if (num < 0) {
            if (customizations.negativeNumbers === '(100)') {
                formattedStr = '(' + formattedStr + ')';
            } else {
                formattedStr = '-' + formattedStr;
            }
        }

        if (num < 0 && customizations.negativeRed) {
            return <span className="text-red-600 font-medium">{formattedStr}</span>;
        }

        return formattedStr;
    };

    const defaultCustomizations = {`
);

content = content.replace(
    /<td key=\{j\} className="p-2 text-\[12px\] text-gray-700" style=\{\{ textAlign: col.align \|\| 'left' \}\}>\n\s*\{col.format \? col.format\(row\[col.key\]\) : row\[col.key\]\}\n\s*<\/td>/g,
    `<td key={j} className="p-2 text-[12px] text-gray-700" style={{ textAlign: col.align || 'left' }}>
                                                    {col.format ? formatValue(col.format(row[col.key])) : formatValue(row[col.key])}
                                                </td>`
);

// 3. FOOTER LOGIC
content = content.replace(
    /<div className="px-8 py-6 flex items-center justify-between text-\[12px\] text-gray-500 border-t border-gray-100 mt-auto">\n\s*<button onClick=\{\(\) => setShowNoteArea\(!showNoteArea\)\} className="flex items-center gap-1.5 text-\[#0077c5\] font-bold hover:underline">\n\s*<FileText size=\{14\} \/> \{showNoteArea \? 'Hide note' : 'Add note'\}\n\s*<\/button>\n\s*<span>\{new Date\(\).toLocaleString\('en-US', \{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' \}\)\}<\/span>\n\s*<\/div>/g,
    `                    {/* Footer */}
                    <div className={\`px-8 py-6 flex flex-col text-[12px] text-gray-500 border-t border-gray-100 mt-auto \${
                        customizations.footerAlignment === 'Left' ? 'items-start text-left' : 
                        customizations.footerAlignment === 'Right' ? 'items-end text-right' : 'items-center text-center'
                    }\`}>
                        <div className="w-full flex items-center justify-between mb-4">
                            <button onClick={() => setShowNoteArea(!showNoteArea)} className="flex items-center gap-1.5 text-[#0077c5] font-bold hover:underline">
                                <FileText size={14} /> {showNoteArea ? 'Hide note' : 'Add note'}
                            </button>
                        </div>
                        
                        <div className="flex gap-2 font-medium">
                            {customizations.showDatePrepared && <span>{new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                            {customizations.showDatePrepared && customizations.showTimePrepared && <span>at</span>}
                            {customizations.showTimePrepared && <span>{new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                        {customizations.showReportBasis && (
                            <div className="mt-1 opacity-75">
                                Accrual Basis
                            </div>
                        )}
                    </div>`
);

fs.writeFileSync('src/components/ReportTemplate.jsx', content);
