const fs = require('fs');
let content = fs.readFileSync('src/components/modals/AdminReports/ReportCustomizeModal.jsx', 'utf8');

content = content.replace(
    "const ReportCustomizeModal = ({ isOpen, onClose }) => {",
    "const ReportCustomizeModal = ({ isOpen, onClose, customizations, onApply }) => {\n    const [localState, setLocalState] = React.useState(customizations || {});\n    \n    React.useEffect(() => {\n        if (isOpen && customizations) {\n            setLocalState(customizations);\n        }\n    }, [isOpen, customizations]);\n\n    const updateState = (key, value) => {\n        setLocalState(prev => ({ ...prev, [key]: value }));\n    };"
);

content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" \/>\s*<span className="text-\[13px\] text-gray-700">Divide by 1000<\/span>/g,
    `<input type="checkbox" checked={localState.divideBy1000 || false} onChange={e => updateState('divideBy1000', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                            <span className="text-[13px] text-gray-700">Divide by 1000</span>`
);

content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" \/>\s*<span className="text-\[13px\] text-gray-700">Don't show currency symbol<\/span>/g,
    `<input type="checkbox" checked={localState.hideCurrency || false} onChange={e => updateState('hideCurrency', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                            <span className="text-[13px] text-gray-700">Don't show currency symbol</span>`
);

content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" \/>\s*<span className="text-\[13px\] text-gray-700">Round to the nearest whole number<\/span>/g,
    `<input type="checkbox" checked={localState.roundWholeNumber || false} onChange={e => updateState('roundWholeNumber', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                            <span className="text-[13px] text-gray-700">Round to the nearest whole number</span>`
);

content = content.replace(
    /<select className="w-24 h-9 border border-gray-300 rounded px-2 text-\[13px\] text-gray-700 outline-none focus:border-\[#0077c5\]">\s*<option>-100<\/option>\s*<option>\(100\)<\/option>\s*<\/select>/g,
    `<select value={localState.negativeNumbers || '-100'} onChange={e => updateState('negativeNumbers', e.target.value)} className="w-24 h-9 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]">\n                                                    <option value="-100">-100</option>\n                                                    <option value="(100)">(100)</option>\n                                                </select>`
);

content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" \/>\s*<span className="text-\[13px\] text-gray-700">Show in red<\/span>/g,
    `<input type="checkbox" checked={localState.negativeRed || false} onChange={e => updateState('negativeRed', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                                    <span className="text-[13px] text-gray-700">Show in red</span>`
);

content = content.replace(
    /<input type="radio" name="emptyCells" className="w-4 h-4 text-\[#0077c5\] border-gray-300 focus:ring-\[#0077c5\]" \/>\s*<span className="text-\[13px\] text-gray-600">Dash<\/span>/g,
    `<input type="radio" name="emptyCells" checked={localState.showEmptyAs === 'dash'} onChange={() => updateState('showEmptyAs', 'dash')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-600">Dash</span>`
);
content = content.replace(
    /<input type="radio" name="emptyCells" className="w-4 h-4 text-\[#0077c5\] border-gray-300 focus:ring-\[#0077c5\]" defaultChecked \/>\s*<span className="text-\[13px\] text-gray-600">Blank<\/span>/g,
    `<input type="radio" name="emptyCells" checked={localState.showEmptyAs === 'blank' || localState.showEmptyAs === undefined} onChange={() => updateState('showEmptyAs', 'blank')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-600">Blank</span>`
);

content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" \/>\s*<span className="text-\[13px\] text-gray-700">Company logo<\/span>/g,
    `<input type="checkbox" checked={localState.showLogo || false} onChange={e => updateState('showLogo', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-700">Company logo</span>`
);
content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" defaultChecked \/>\s*<span className="text-\[13px\] text-gray-700">Report period<\/span>/g,
    `<input type="checkbox" checked={localState.showReportPeriod !== false} onChange={e => updateState('showReportPeriod', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-700">Report period</span>`
);
content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" defaultChecked \/>\s*<span className="text-\[13px\] text-gray-700">Company name<\/span>/g,
    `<input type="checkbox" checked={localState.showCompanyName !== false} onChange={e => updateState('showCompanyName', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-700">Company name</span>`
);

content = content.replace(
    /<label className="block text-\[12px\] text-gray-700 mb-1">Header alignment<\/label>\s*<select className="w-full h-9 border border-gray-300 rounded px-2 text-\[13px\] text-gray-700 outline-none focus:border-\[#0077c5\]">\s*<option>Centre<\/option>\s*<option>Left<\/option>\s*<option>Right<\/option>\s*<\/select>/g,
    `<label className="block text-[12px] text-gray-700 mb-1">Header alignment</label>\n                                            <select value={localState.headerAlignment || 'Center'} onChange={e => updateState('headerAlignment', e.target.value)} className="w-full h-9 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]">\n                                                <option value="Center">Centre</option>\n                                                <option value="Left">Left</option>\n                                                <option value="Right">Right</option>\n                                            </select>`
);

content = content.replace(
    /<input type="radio" name="headerLayout" className="w-4 h-4 text-\[#0077c5\] border-gray-300 focus:ring-\[#0077c5\]" defaultChecked \/>\s*<span className="text-\[13px\] text-gray-600">Company name first<\/span>/g,
    `<input type="radio" name="headerLayout" checked={localState.headerLayout === 'companyFirst' || localState.headerLayout === undefined} onChange={() => updateState('headerLayout', 'companyFirst')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />\n                                                    <span className="text-[13px] text-gray-600">Company name first</span>`
);
content = content.replace(
    /<input type="radio" name="headerLayout" className="w-4 h-4 text-\[#0077c5\] border-gray-300 focus:ring-\[#0077c5\]" \/>\s*<span className="text-\[13px\] text-gray-600">Report title first<\/span>/g,
    `<input type="radio" name="headerLayout" checked={localState.headerLayout === 'titleFirst'} onChange={() => updateState('headerLayout', 'titleFirst')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />\n                                                    <span className="text-[13px] text-gray-600">Report title first</span>`
);

content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" defaultChecked \/>\s*<span className="text-\[13px\] text-gray-700">Date prepared<\/span>/g,
    `<input type="checkbox" checked={localState.showDatePrepared !== false} onChange={e => updateState('showDatePrepared', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-700">Date prepared</span>`
);
content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" defaultChecked \/>\s*<span className="text-\[13px\] text-gray-700">Time prepared<\/span>/g,
    `<input type="checkbox" checked={localState.showTimePrepared !== false} onChange={e => updateState('showTimePrepared', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-700">Time prepared</span>`
);
content = content.replace(
    /<input type="checkbox" className="w-4 h-4 text-\[#0077c5\] rounded border-gray-300 focus:ring-\[#0077c5\]" defaultChecked \/>\s*<span className="text-\[13px\] text-gray-700">Report basis \(cash vs. accrual\)<\/span>/g,
    `<input type="checkbox" checked={localState.showReportBasis !== false} onChange={e => updateState('showReportBasis', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />\n                                                <span className="text-[13px] text-gray-700">Report basis (cash vs. accrual)</span>`
);

content = content.replace(
    /<label className="block text-\[12px\] text-gray-700 mb-1">Footer alignment<\/label>\s*<select className="w-full h-9 border border-gray-300 rounded px-2 text-\[13px\] text-gray-700 outline-none focus:border-\[#0077c5\]">\s*<option>Centre<\/option>\s*<option>Left<\/option>\s*<option>Right<\/option>\s*<\/select>/g,
    `<label className="block text-[12px] text-gray-700 mb-1">Footer alignment</label>\n                                            <select value={localState.footerAlignment || 'Center'} onChange={e => updateState('footerAlignment', e.target.value)} className="w-full h-9 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]">\n                                                <option value="Center">Centre</option>\n                                                <option value="Left">Left</option>\n                                                <option value="Right">Right</option>\n                                            </select>`
);

content = content.replace(
    /<button onClick={onClose} className="px-6 py-2.5 text-\[14px\] font-bold bg-\[#0077c5\] text-white hover:bg-\[#005ca6\] rounded-full transition-colors shadow-sm">\s*Apply changes\s*<\/button>/g,
    `<button onClick={() => { if(onApply) onApply(localState); onClose(); }} className="px-6 py-2.5 text-[14px] font-bold bg-[#0077c5] text-white hover:bg-[#005ca6] rounded-full transition-colors shadow-sm">\n                        Apply changes\n                    </button>`
);

fs.writeFileSync('src/components/modals/AdminReports/ReportCustomizeModal.jsx', content);
