const fs = require('fs');
const file = 'src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('import DashboardSettingsDropdown')) {
    content = content.replace(
        "import GlobalSearchModal from '../components/modals/GlobalSearchModal';",
        "import GlobalSearchModal from '../components/modals/GlobalSearchModal';\nimport DashboardSettingsDropdown from '../components/modals/DashboardSettingsDropdown';"
    );
}

// 2. Add State
if (!content.includes('const [dashboardSettings, setDashboardSettings] =')) {
    content = content.replace(
        "const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);",
        "const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);\n    const [showDashboardDisplayDropdown, setShowDashboardDisplayDropdown] = useState(false);\n\n    const [dashboardSettings, setDashboardSettings] = useState(() => {\n        try {\n            const saved = localStorage.getItem('dashboardDisplaySettings');\n            return saved ? JSON.parse(saved) : {\n                compactLayout: false, listLayout: false, solidCards: false, roundedButtons: false, fullWidth: false, disableAnimations: false, grayscale: false, fontFamily: 'Default'\n            };\n        } catch { return {}; }\n    });\n\n    const updateDashboardSettings = (newSettings) => {\n        setDashboardSettings(newSettings);\n        localStorage.setItem('dashboardDisplaySettings', JSON.stringify(newSettings));\n    };"
    );
}

// 3. Render Button
if (!content.includes('<DashboardSettingsDropdown')) {
    content = content.replace(
        "{/* Help / Learn More Icon */}",
        "{/* Dashboard Display Settings Icon */}\n                        <div className=\"relative\">\n                            <button\n                                onClick={() => setShowDashboardDisplayDropdown(!showDashboardDisplayDropdown)}\n                                className=\"flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-[#0078d4]\"\n                                title=\"Display Settings\"\n                            >\n                                <SlidersHorizontal size={20} />\n                            </button>\n                            <DashboardSettingsDropdown\n                                isOpen={showDashboardDisplayDropdown}\n                                onClose={() => setShowDashboardDisplayDropdown(false)}\n                                settings={dashboardSettings}\n                                onSettingsChange={updateDashboardSettings}\n                            />\n                        </div>\n                        {/* Help / Learn More Icon */}"
    );
}

// 4. Apply Styles to Root Container
// Search for: return (\n        <div className="h-screen w-screen flex flex-col font-['Plus_Jakarta_Sans'] bg-slate-50 select-none text-slate-800 overflow-hidden">
content = content.replace(
    'return (\n        <div className="h-screen w-screen flex flex-col font-[\'Plus_Jakarta_Sans\'] bg-slate-50 select-none text-slate-800 overflow-hidden">',
    'return (\n        <div className={`h-screen w-screen flex flex-col bg-slate-50 select-none text-slate-800 overflow-hidden ${dashboardSettings?.fontFamily === "Monospace" ? "font-mono" : (dashboardSettings?.fontFamily === "Serif" ? "font-serif" : "font-sans")}`}\n            style={{\n                filter: [\n                    dashboardSettings?.grayscale ? "grayscale(1)" : ""\n                ].filter(Boolean).join(" ") || "none",\n                transform: dashboardSettings?.compactLayout ? "scale(0.92)" : "scale(1)",\n                transformOrigin: "top center",\n                transition: dashboardSettings?.disableAnimations ? "none" : "all 0.3s ease-in-out"\n            }}\n        >\n        {dashboardSettings?.disableAnimations && (\n            <style>{`\n                *, *::before, *::after {\n                    transition: none !important;\n                    animation: none !important;\n                }\n            `}</style>\n        )}\n        {dashboardSettings?.fontFamily && dashboardSettings.fontFamily !== "Default" && (\n            <style>{`\n                * {\n                    font-family: ${dashboardSettings.fontFamily === "Inter" ? "\\"\\"Inter\\", sans-serif\\"" :\n                    dashboardSettings.fontFamily === "Monospace" ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \\"Liberation Mono\\", \\"Courier New\\", monospace" :\n                    dashboardSettings.fontFamily === "Tahoma" ? "\\"\\"Tahoma\\", sans-serif\\"" : "inherit"} !important;\n                }\n            `}</style>\n        )}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched');
