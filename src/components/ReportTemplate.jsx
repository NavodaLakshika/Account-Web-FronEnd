import React, { useEffect, useState, useRef } from 'react';
import SimpleModal from './SimpleModal';
import {
    Printer,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RefreshCw,
    Search,
    Download,
    Monitor,
    Smartphone,
    Settings2,
    Palette,
    Type,
    Maximize,
    Ruler,
    Bold,
    Italic,
    Underline,
    Check,
    X,
    Type as TypeIcon,
    MousePointer2,
    Globe,
    Baseline,
    FileText,
    Eye,
    EyeOff,
    Columns,
    Layout,
    Building2,
    PenTool,
    Hash,
    Maximize2,
    MoveHorizontal,
    MoveVertical,
    Save,
    RotateCcw,
    Settings,
    LayoutGrid,
    ListFilter,
    PanelLeftClose,
    Droplets,
    LayoutTemplate
} from 'lucide-react';

const ReportTemplate = ({
    title,
    subtitle,
    data = [],
    columns,
    companyName = "Onimta Information Technology",
    companyAddress = "Lake Road,Maharagama,Sri Lanka",
    isStandalone = true
}) => {
    // --- Initial Defaults ---
    const DEFAULTS = {
        fontFamily: "'Tahoma', sans-serif",
        fontSize: 13,
        fontColor: '#334155',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        rowSpacing: 8,
        colSpacing: 16,
        isLandscape: true,
        reportSize: 'A4',
        workspaceTheme: 'classic',
        pagePadding: '10mm',
        signatureStyle: 'dotted',
        customWidth: 210,
        customHeight: 297
    };

    // --- State Management ---
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showFontModal, setShowFontModal] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);
    const [showCustomSizeModal, setShowCustomSizeModal] = useState(false);
    const [showVisibilityModal, setShowVisibilityModal] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const [colorSearch, setColorSearch] = useState('');
    const [colVisibilitySearch, setColVisibilitySearch] = useState('');
    
    // Core Layout States
    const [isLandscape, setIsLandscape] = useState(DEFAULTS.isLandscape);
    const [reportSize, setReportSize] = useState(DEFAULTS.reportSize);
    const [workspaceTheme, setWorkspaceTheme] = useState(DEFAULTS.workspaceTheme);
    const [rowSpacing, setRowSpacing] = useState(DEFAULTS.rowSpacing);
    const [colSpacing, setColSpacing] = useState(DEFAULTS.colSpacing);
    
    // Core Style States
    const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily);
    const [fontSize, setFontSize] = useState(DEFAULTS.fontSize);
    const [fontColor, setFontColor] = useState(DEFAULTS.fontColor);
    const [isBold, setIsBold] = useState(DEFAULTS.isBold);
    const [isItalic, setIsItalic] = useState(DEFAULTS.isItalic);
    const [isUnderline, setIsUnderline] = useState(DEFAULTS.isUnderline);
    const [pagePadding, setPagePadding] = useState(DEFAULTS.pagePadding);
    const [signatureStyle, setSignatureStyle] = useState(DEFAULTS.signatureStyle);

    // Custom Size States
    const [customWidth, setCustomWidth] = useState(DEFAULTS.customWidth);
    const [customHeight, setCustomHeight] = useState(DEFAULTS.customHeight);

    // Interaction Matrix States
    const [activeCell, setActiveCell] = useState(null); 
    const [cellStyles, setCellStyles] = useState({}); 
    const [editedCells, setEditedCells] = useState({}); 
    const [hiddenColumns, setHiddenColumns] = useState([]); 
    const [hiddenCells, setHiddenCells] = useState([]); 
    const [styleMode, setStyleMode] = useState('global'); 

    // Visibility Parts
    const [showCompanyInfo, setShowCompanyInfo] = useState(true);
    const [showReportTitle, setShowReportTitle] = useState(true);
    const [showSignatures, setShowSignatures] = useState(true);
    const [showPageNumbers, setShowPageNumbers] = useState(true);
    const [showTimestamp, setShowTimestamp] = useState(true);

    // --- Persistence Engine ---
    useEffect(() => {
        const saved = localStorage.getItem(`report_settings_${title}`);
        if (saved) {
            try {
                const config = JSON.parse(saved);
                setIsLandscape(config.isLandscape ?? DEFAULTS.isLandscape);
                setReportSize(config.reportSize ?? DEFAULTS.reportSize);
                setWorkspaceTheme(config.workspaceTheme ?? DEFAULTS.workspaceTheme);
                setRowSpacing(config.rowSpacing ?? DEFAULTS.rowSpacing);
                setColSpacing(config.colSpacing ?? DEFAULTS.colSpacing);
                setFontFamily(config.fontFamily ?? DEFAULTS.fontFamily);
                setFontSize(config.fontSize ?? DEFAULTS.fontSize);
                setFontColor(config.fontColor ?? DEFAULTS.fontColor);
                setIsBold(config.isBold ?? DEFAULTS.isBold);
                setIsItalic(config.isItalic ?? DEFAULTS.isItalic);
                setIsUnderline(config.isUnderline ?? DEFAULTS.isUnderline);
                setSignatureStyle(config.signatureStyle ?? DEFAULTS.signatureStyle);
                setCustomWidth(config.customWidth ?? DEFAULTS.customWidth);
                setCustomHeight(config.customHeight ?? DEFAULTS.customHeight);
                if (config.cellStyles) setCellStyles(config.cellStyles);
                if (config.hiddenColumns) setHiddenColumns(config.hiddenColumns);
            } catch (e) { console.error("Persistence Load Failure", e); }
        }
        document.title = `${title} - ${companyName}`;
    }, [title, companyName]);

    const handleSaveSettings = () => {
        const config = {
            isLandscape, reportSize, workspaceTheme, rowSpacing, colSpacing,
            fontFamily, fontSize, fontColor, isBold, isItalic, isUnderline,
            cellStyles, hiddenColumns, signatureStyle, customWidth, customHeight
        };
        localStorage.setItem(`report_settings_${title}`, JSON.stringify(config));
        setShowSettings(false);
    };

    const handleResetDefaults = () => {
        setIsLandscape(DEFAULTS.isLandscape);
        setReportSize(DEFAULTS.reportSize);
        setWorkspaceTheme(DEFAULTS.workspaceTheme);
        setRowSpacing(DEFAULTS.rowSpacing);
        setColSpacing(DEFAULTS.colSpacing);
        setFontFamily(DEFAULTS.fontFamily);
        setFontSize(DEFAULTS.fontSize);
        setFontColor(DEFAULTS.fontColor);
        setIsBold(DEFAULTS.isBold);
        setIsItalic(DEFAULTS.isItalic);
        setIsUnderline(DEFAULTS.isUnderline);
        setSignatureStyle(DEFAULTS.signatureStyle);
        setCustomWidth(DEFAULTS.customWidth);
        setCustomHeight(DEFAULTS.customHeight);
        setCellStyles({});
        setHiddenColumns([]);
        setHiddenCells([]);
        setEditedCells({});
    };

    // --- Pagination Handlers ---
    const pageSize = isLandscape ? 20 : 30;
    const filteredData = data.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())));
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = filteredData.slice(startIndex, startIndex + pageSize);
    const visibleColumns = columns.filter(col => !hiddenColumns.includes(col.key));

    const handleFirstPage = () => setCurrentPage(1);
    const handleLastPage = () => setCurrentPage(totalPages || 1);
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1));

    const getPageDimensions = () => {
        if (reportSize === 'Custom') {
            return { w: `${customWidth}mm`, h: `${customHeight}mm` };
        }
        const sizes = { 'A4': { p: 210, l: 297 }, 'A3': { p: 297, l: 420 }, 'Legal': { p: 216, l: 356 } };
        const current = sizes[reportSize] || sizes['A4'];
        const w = isLandscape ? current.l : current.p;
        const h = isLandscape ? current.p : current.l;
        return { w: `${w}mm`, h: `${h}mm` };
    };

    const dims = getPageDimensions();

    const fontOptions = [
        "Tahoma", "Inter", "Roboto", "Plus Jakarta Sans", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Ubuntu", 
        "Merriweather", "Playfair Display", "Lora", "PT Sans", "PT Serif", "Nunito", "Quicksand", "Oswald", "Work Sans", "Dosis",
        "Arimo", "Bitter", "Cabin", "Crimson Text", "Domine", "Eczar", "Fira Sans", "Heebo", "Inconsolata", "Josefin Sans",
        "Karla", "Libre Baskerville", "Manrope", "Nanum Gothic", "Overpass", "Public Sans", "Rubik", "Space Grotesk", "Titillium Web", "Varela Round",
        "Abel", "Alegreya", "Anton", "Asap", "Assistant", "Barlow", "Bebas Neue", "Cairo", "Chivo", "Comfortaa",
        "DM Sans", "Exo 2", "Fjalla One", "Gelasio", "Hind", "IBM Plex Sans", "Jost", "Kanit", "Lexend", "Mako",
        "Noticia Text", "Orbitron", "Padauk", "Questrial", "Rokkitt", "Signika", "Teko", "Urbanist", "Vollkorn", "Xanh Mono",
        "Yantramanav", "Zilla Slab", "Avenir", "Helvetica", "Arial", "Verdana", "Trebuchet MS", "Georgia", "Times New Roman", "Courier New",
        "Segoe UI", "Calibri", "Candara", "Geneva", "Optima", "Palatino", "Garamond", "Bookman", "Avant Garde", "Century Gothic",
        "Impact", "Copperplate", "Didot", "Monaco", "Lucida Console", "Consolas", "Fixedsys", "System-ui", "Baskerville", "Bodoni"
    ].sort();

    const curatedColors = [
        { name: "Slate Dark", hex: "#0f172a" }, { name: "Slate Primary", hex: "#334155" }, { name: "Slate Light", hex: "#64748b" },
        { name: "Ink Black", hex: "#000000" }, { name: "Charcoal", hex: "#2d3436" }, { name: "Steel", hex: "#4a4a4a" },
        { name: "Deep Royal", hex: "#1e3a8a" }, { name: "Financial Blue", hex: "#0284c7" }, { name: "Sky Corporate", hex: "#0ea5e9" },
        { name: "Forest Green", hex: "#14532d" }, { name: "Success Emerald", hex: "#059669" }, { name: "Vibrant Green", hex: "#10b981" },
        { name: "Ruby Red", hex: "#991b1b" }, { name: "Critical Error", hex: "#dc2626" }, { name: "Bright Red", hex: "#ef4444" },
        { name: "Deep Purple", hex: "#581c87" }, { name: "Royal Violet", hex: "#7c3aed" }, { name: "Light Lavender", hex: "#a78bfa" },
        { name: "Burnt Orange", hex: "#9a3412" }, { name: "Warning Gold", hex: "#d97706" }, { name: "Sunset", hex: "#f97316" },
        { name: "Deep Maroon", hex: "#7f1d1d" }, { name: "Earth Brown", hex: "#451a03" }, { name: "Sand", hex: "#78350f" },
        { name: "Navy Blue", hex: "#172554" }, { name: "Pacific Blue", hex: "#0369a1" }, { name: "Arctic Blue", hex: "#0ea5e9" },
        { name: "Teal Dark", hex: "#134e4a" }, { name: "Teal Primary", hex: "#0d9488" }, { name: "Teal Mint", hex: "#2dd4bf" },
        { name: "Rose Dark", hex: "#881337" }, { name: "Rose Primary", hex: "#e11d48" }, { name: "Rose Soft", hex: "#fb7185" },
        { name: "Midnight Indigo", hex: "#312e81" }, { name: "Classic Indigo", hex: "#4f46e5" }, { name: "Soft Indigo", hex: "#818cf8" }
    ];

    const filteredFonts = fontOptions.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));
    const filteredColors = curatedColors.filter(c => c.name.toLowerCase().includes(colorSearch.toLowerCase()) || c.hex.toLowerCase().includes(colorSearch.toLowerCase()));

    const getActiveStyle = (type) => {
        if (styleMode === 'global') {
            switch(type) {
                case 'bold': return isBold;
                case 'italic': return isItalic;
                case 'underline': return isUnderline;
                case 'size': return fontSize;
                case 'color': return fontColor;
                case 'family': return fontFamily;
                default: return null;
            }
        } else if (activeCell) {
            const key = activeCell.rowIndex === 'special' ? activeCell.columnKey : `${activeCell.rowIndex}_${activeCell.columnKey}`;
            const style = cellStyles[key] || {};
            switch(type) {
                case 'bold': return style.bold ?? (activeCell.rowIndex === 'special' ? (activeCell.columnKey.startsWith('header_') || activeCell.columnKey === 'report_title' ? true : false) : isBold);
                case 'italic': return style.italic ?? (activeCell.rowIndex === 'special' ? false : isItalic);
                case 'underline': return style.underline ?? (activeCell.rowIndex === 'special' ? false : isUnderline);
                case 'size': return style.size ?? (activeCell.rowIndex === 'special' ? (activeCell.columnKey === 'company_name' ? 36 : (activeCell.columnKey === 'report_title' ? 14 : (activeCell.columnKey.startsWith('header_') ? 11 : 13))) : fontSize);
                case 'color': return style.color ?? (activeCell.rowIndex === 'special' ? (activeCell.columnKey === 'company_name' ? fontColor : (activeCell.columnKey === 'report_title' ? '#ffffff' : (activeCell.columnKey.startsWith('header_') ? fontColor : '#64748b'))) : fontColor);
                case 'family': return style.family ?? fontFamily;
                default: return null;
            }
        }
        return null;
    };

    const updateStyle = (type, value) => {
        if (styleMode === 'global') {
            switch(type) {
                case 'bold': setIsBold(value); break;
                case 'italic': setIsItalic(value); break;
                case 'underline': setIsUnderline(value); break;
                case 'size': setFontSize(value); break;
                case 'color': setFontColor(value); break;
                case 'family': setFontFamily(value); break;
            }
        } else if (activeCell) {
            const key = activeCell.rowIndex === 'special' ? activeCell.columnKey : `${activeCell.rowIndex}_${activeCell.columnKey}`;
            setCellStyles(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [type]: value } }));
        }
    };

    const handleCellBlur = (key, e) => {
        setEditedCells(prev => ({ ...prev, [key]: e.target.innerText }));
    };

    const toggleColumn = (key) => {
        setHiddenColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const toggleCellVisibility = () => {
        if (!activeCell) return;
        const key = activeCell.rowIndex === 'special' ? activeCell.columnKey : `${activeCell.rowIndex}_${activeCell.columnKey}`;
        setHiddenCells(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const getSpecialStyle = (key, defaultStyle = {}) => {
        const style = cellStyles[key] || {};
        return {
            ...defaultStyle,
            color: style.color || defaultStyle.color,
            fontSize: style.size ? `${style.size}px` : defaultStyle.fontSize,
            fontWeight: style.bold !== undefined ? (style.bold ? 'bold' : 'normal') : defaultStyle.fontWeight,
            fontStyle: style.italic !== undefined ? (style.italic ? 'italic' : 'normal') : defaultStyle.fontStyle,
            textDecoration: style.underline !== undefined ? (style.underline ? 'underline' : 'none') : defaultStyle.textDecoration,
            fontFamily: style.family || defaultStyle.fontFamily
        };
    };

    return (
        <div className={`fixed inset-0 flex flex-col select-text overflow-hidden transition-colors duration-500 ${workspaceTheme === 'classic' ? 'bg-[#808080]' : 'bg-slate-100'}`} style={{ fontFamily }}>
            <style>
                {`
                    ::selection { background: ${fontColor} !important; color: white !important; }
                    @media print {
                        @page { size: ${dims.w} ${dims.h}; margin: 0; }
                        body { background: white !important; margin: 0; padding: 0; }
                        .no-print { display: none !important; }
                        .print-area { box-shadow: none !important; border: none !important; margin: 0 !important; width: ${dims.w} !important; min-height: ${dims.h} !important; padding: 8mm !important; transform: none !important; }
                        .cell-selected { border-color: transparent !important; background: transparent !important; outline: none !important; }
                        .cell-hidden { display: none !important; }
                    }
                    .report-workspace { flex: 1; overflow: auto; padding: 40px; display: flex; flex-direction: column; align-items: center; }
                    .print-area { width: ${dims.w}; min-height: ${dims.h}; background: white; padding: ${pagePadding}; box-shadow: ${workspaceTheme === 'classic' ? '10px 10px 5px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.1)'}; position: relative; box-sizing: border-box; transition: all 0.3s ease; flex-shrink: 0; margin-bottom: 40px; }
                    .dynamic-report-text { color: ${fontColor}; font-size: ${fontSize}px; font-weight: ${isBold ? 'bold' : 'normal'}; font-style: ${isItalic ? 'italic' : 'normal'}; text-decoration: ${isUnderline ? 'underline' : 'none'}; font-family: ${fontFamily}; }
                    .cell-selected { outline: 2px solid #3b82f6 !important; outline-offset: 4px; background: rgba(59, 130, 246, 0.05); }
                    .cell-hidden { opacity: 0.1; background: repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #ffffff 10px, #ffffff 20px); }
                    .editable-cell:focus { background: white !important; outline: 2px solid #3b82f6 !important; box-shadow: 0 0 10px rgba(59, 130, 246, 0.1); z-index: 20; }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}
            </style>

            {/* Typography Hub Drawer */}
            <div className={`fixed left-0 top-0 bottom-0 w-[260px] bg-white shadow-2xl z-[120] border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out ${showFontModal ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-14 border-b border-gray-50 flex items-center justify-between px-5 bg-slate-50 shrink-0">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><TypeIcon size={12} className="text-blue-600" /> Typography Hub</span>
                    <button onClick={() => setShowFontModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-3 border-b border-gray-50 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input type="text" placeholder="Filter fonts..." value={fontSearch} onChange={(e) => setFontSearch(e.target.value)} className="w-full h-8 pl-8 pr-3 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-medium outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                    {filteredFonts.map((f, i) => (
                        <button key={i} onClick={() => { updateStyle('family', `'${f}', sans-serif`); setShowFontModal(false); }} className={`w-full h-10 px-3 rounded-lg flex items-center justify-between transition-all group relative ${getActiveStyle('family')?.includes(f) ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-slate-600'}`}>
                            <span className="text-[12px] font-medium truncate" style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span>
                            {getActiveStyle('family')?.includes(f) && <Check size={10} className="text-white" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Matrix Drawer */}
            <div className={`fixed left-0 top-0 bottom-0 w-[260px] bg-white shadow-2xl z-[130] border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out ${showColorModal ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-14 border-b border-gray-50 flex items-center justify-between px-5 bg-slate-50 shrink-0">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Palette size={14} className="text-pink-500" /> Color Matrix</span>
                    <button onClick={() => setShowColorModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-3 border-b border-gray-50 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input type="text" placeholder="Search colors..." value={colorSearch} onChange={(e) => setColorSearch(e.target.value)} className="w-full h-8 pl-8 pr-3 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-medium outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-2 grid grid-cols-1 gap-1.5">
                    {filteredColors.map((c, i) => (
                        <button key={i} onClick={() => { updateStyle('color', c.hex); setShowColorModal(false); }} className={`w-full h-10 px-2.5 rounded-xl flex items-center gap-3 transition-all border ${getActiveStyle('color') === c.hex ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-50 hover:bg-slate-50 hover:border-slate-200'}`}>
                            <div className="w-5 h-5 rounded-lg shadow-inner shrink-0 border border-black/5" style={{ backgroundColor: c.hex }} />
                            <div className="flex flex-col items-start truncate">
                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight truncate w-full">{c.name}</span>
                                <span className="text-[8px] font-mono font-bold text-slate-400">{c.hex.toUpperCase()}</span>
                            </div>
                            {getActiveStyle('color') === c.hex && <Check size={10} className="ml-auto text-slate-900" />}
                        </button>
                    ))}
                    <div className="pt-3 pb-2 text-center border-t border-slate-50 mt-1">
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-2">Custom Hex</label>
                        <div className="flex gap-2 items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                             <input type="color" value={getActiveStyle('color')} onChange={(e) => updateStyle('color', e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-none p-0 overflow-hidden shrink-0" />
                             <input type="text" value={getActiveStyle('color')} onChange={(e) => updateStyle('color', e.target.value)} className="w-full bg-transparent border-none text-[10px] font-black font-mono text-slate-900 outline-none uppercase" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Visibility Hub Drawer (NEW) */}
            <div className={`fixed left-0 top-0 bottom-0 w-[260px] bg-white shadow-2xl z-[140] border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out ${showVisibilityModal ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-14 border-b border-gray-50 flex items-center justify-between px-5 bg-slate-50 shrink-0">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><LayoutTemplate size={14} className="text-emerald-500" /> Visibility Hub</span>
                    <button onClick={() => setShowVisibilityModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 flex-1 space-y-6 overflow-y-auto no-scrollbar">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Columns size={12} className="text-emerald-500" /><span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Columns</span></div><div className="flex gap-1"><button onClick={() => setHiddenColumns([])} className="text-[8px] font-black text-blue-600 hover:underline transition-all">ALL</button><button onClick={() => setHiddenColumns(columns.map(c => c.key))} className="text-[8px] font-black text-red-400 hover:underline transition-all">NONE</button></div></div>
                        <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={10} /><input type="text" placeholder="Filter columns..." value={colVisibilitySearch} onChange={(e) => setColVisibilitySearch(e.target.value)} className="w-full h-8 pl-8 pr-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] outline-none focus:border-emerald-200 transition-all"/></div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {columns.filter(c => c.header.toLowerCase().includes(colVisibilitySearch.toLowerCase())).map((col) => (
                                <button key={col.key} onClick={() => toggleColumn(col.key)} className={`flex items-center justify-between px-3 h-9 rounded-xl border transition-all ${hiddenColumns.includes(col.key) ? 'bg-red-50/30 border-red-100/50 text-red-300 grayscale italic' : 'bg-white border-slate-100 text-slate-700 shadow-sm hover:border-emerald-200'}`}>
                                    <span className="text-[10px] font-bold truncate pr-2">{col.header}</span>
                                    {hiddenColumns.includes(col.key) ? <EyeOff size={12} /> : <Check size={12} className="text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[1px] bg-slate-50" />
                    <div className="space-y-4">
                        <div className="flex items-center gap-2"><Layout size={12} className="text-emerald-500" /><span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Part Visibility</span></div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setShowCompanyInfo(!showCompanyInfo)} className={`flex items-center gap-2 px-2.5 h-9 rounded-xl border transition-all text-[9px] font-bold ${showCompanyInfo ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><Building2 size={12}/> Info</button>
                            <button onClick={() => setShowReportTitle(!showReportTitle)} className={`flex items-center gap-2 px-2.5 h-9 rounded-xl border transition-all text-[9px] font-bold ${showReportTitle ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><FileText size={12}/> Title</button>
                            <button onClick={() => setShowSignatures(!showSignatures)} className={`flex items-center gap-2 px-2.5 h-9 rounded-xl border transition-all text-[9px] font-bold ${showSignatures ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><PenTool size={12}/> Sign</button>
                            <button onClick={() => setShowPageNumbers(!showPageNumbers)} className={`flex items-center gap-2 px-2.5 h-9 rounded-xl border transition-all text-[9px] font-bold ${showPageNumbers ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><Hash size={12}/> Pages</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dimension Hub Drawer */}
            <div className={`fixed left-0 top-0 bottom-0 w-[240px] bg-white shadow-2xl z-[150] border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out ${showCustomSizeModal ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-14 border-b border-gray-50 flex items-center justify-between px-5 bg-slate-50 shrink-0">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Ruler size={14} className="text-blue-500" /> Dimensions</span>
                    <button onClick={() => setShowCustomSizeModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-5 flex-1 space-y-6 overflow-y-auto no-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MoveHorizontal size={10} className="text-blue-500"/> Width (mm)</label>
                            <input type="number" value={customWidth} onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)} className="w-full h-9 px-3 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"/>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MoveVertical size={10} className="text-blue-500"/> Height (mm)</label>
                            <input type="number" value={customHeight} onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)} className="w-full h-9 px-3 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"/>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase tracking-wider"><Monitor size={10}/> Live Active</div>
                        <p className="text-[10px] font-medium text-blue-700/70 leading-tight">Dimensions are applied instantly to the document.</p>
                    </div>
                    <div className="pt-2"><button onClick={() => setShowCustomSizeModal(false)} className="w-full h-11 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"><Check size={14}/> APPLY</button></div>
                </div>
            </div>

            {/* Top Toolbar */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 no-print shrink-0 shadow-sm z-[100] font-sans text-slate-800">
                <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
                    <button onClick={() => window.print()} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600" title="Print"><Printer size={18} /></button>
                    <button onClick={() => window.location.reload()} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-600" title="Refresh"><RefreshCw size={16} /></button>
                    <button onClick={() => { setIsLandscape(!isLandscape); setCurrentPage(1); }} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${isLandscape ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`} title="Orientation">
                        {isLandscape ? <Monitor size={18} /> : <Smartphone size={18} />}
                    </button>
                </div>

                <div className="flex items-center gap-1 border-r border-slate-200 px-4">
                    <button onClick={handleFirstPage} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"><ChevronsLeft size={18} /></button>
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"><ChevronLeft size={18} /></button>
                    <div className="flex items-center gap-2 mx-3">
                        <input type="text" value={currentPage} className="w-12 h-8 bg-slate-50 border border-slate-200 rounded-md text-center text-sm font-bold text-slate-700 outline-none" readOnly />
                        <span className="text-sm font-bold text-slate-400">/ {totalPages || 1}</span>
                    </div>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"><ChevronRight size={18} /></button>
                    <button onClick={handleLastPage} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"><ChevronsRight size={18} /></button>
                </div>

                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search report content..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-[5px] text-sm outline-none focus:border-blue-500 transition-all shadow-sm" />
                </div>

                <div className="ml-auto flex items-center gap-4 relative">
                    <button onClick={() => setShowSettings(!showSettings)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${showSettings ? 'bg-slate-100 text-blue-600 shadow-inner' : 'hover:bg-slate-100 text-slate-400'}`}>
                        <Settings2 size={20} className={showSettings ? 'rotate-90 duration-300' : 'duration-300'} />
                    </button>

                    {showSettings && (
                        <div className="absolute top-12 right-0 w-[300px] bg-white border border-gray-200 shadow-xl rounded-[10px] p-4 z-[110] animate-in zoom-in-95 duration-150 font-sans text-slate-800 overflow-y-auto max-h-[85vh] no-scrollbar">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50 sticky top-0 bg-white z-10">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5"><Settings2 size={12} className="text-blue-500" /> Report Settings</h3>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <button onClick={handleSaveSettings} className="h-8 rounded-lg bg-blue-600 text-white text-[9px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><Save size={12}/> SAVE STYLE</button>
                                <button onClick={handleResetDefaults} className="h-8 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"><RotateCcw size={12}/> RESET ALL</button>
                            </div>
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg mb-4">
                                <button onClick={() => setStyleMode('global')} className={`flex-1 h-7 rounded-[6px] text-[9px] font-black flex items-center justify-center gap-1.5 transition-all ${styleMode === 'global' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><Globe size={10} /> GLOBAL</button>
                                <button onClick={() => { if(activeCell) setStyleMode('selection'); }} className={`flex-1 h-7 rounded-[6px] text-[9px] font-black flex items-center justify-center gap-1.5 transition-all ${!activeCell ? 'opacity-30 cursor-not-allowed' : ''} ${styleMode === 'selection' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}><MousePointer2 size={10} /> SELECTED CELL</button>
                            </div>
                            <div className="space-y-4">
                                {styleMode === 'selection' && activeCell && (
                                    <div className="animate-in slide-in-from-top-1 flex gap-2">
                                        <button onClick={toggleCellVisibility} className={`flex-1 h-8 rounded-lg border text-[10px] font-black flex items-center justify-center gap-2 transition-all ${hiddenCells.includes(activeCell.rowIndex === 'special' ? activeCell.columnKey : `${activeCell.rowIndex}_${activeCell.columnKey}`) ? 'bg-red-600 text-white border-red-600' : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'}`}>
                                            {hiddenCells.includes(activeCell.rowIndex === 'special' ? activeCell.columnKey : `${activeCell.rowIndex}_${activeCell.columnKey}`) ? <Eye size={14}/> : <EyeOff size={14}/>}
                                            {hiddenCells.includes(activeCell.rowIndex === 'special' ? activeCell.columnKey : `${activeCell.rowIndex}_${activeCell.columnKey}`) ? 'RESTORE' : 'HIDE'}
                                        </button>
                                        <button onClick={() => setActiveCell(null)} className="h-8 px-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all"><X size={14}/></button>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Typography</label><button onClick={() => { setShowFontModal(true); setShowColorModal(false); setShowCustomSizeModal(false); setShowVisibilityModal(false); }} className="w-32 h-7 text-[10px] font-bold bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-100 transition-all truncate px-2">{getActiveStyle('family')?.replace(/'/g, '').split(',')[0] || "Default"}</button></div>
                                    <div className="flex items-center justify-between"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Font Style</label><div className="flex gap-1"><button onClick={() => updateStyle('bold', !getActiveStyle('bold'))} className={`w-7 h-6 rounded flex items-center justify-center border transition-all ${getActiveStyle('bold') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-gray-100'}`}><Bold size={12} /></button><button onClick={() => updateStyle('italic', !getActiveStyle('italic'))} className={`w-7 h-6 rounded flex items-center justify-center border transition-all ${getActiveStyle('italic') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-gray-100'}`}><Italic size={12} /></button><button onClick={() => updateStyle('underline', !getActiveStyle('underline'))} className={`w-7 h-6 rounded flex items-center justify-center border transition-all ${getActiveStyle('underline') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-gray-100'}`}><Underline size={12} /></button></div></div>
                                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Size</label><input type="number" value={getActiveStyle('size')} onChange={(e) => updateStyle('size', parseInt(e.target.value) || 8)} className="w-10 h-5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-700 outline-none focus:border-blue-300 text-center"/><span className="text-[9px] font-bold text-slate-300">PX</span></div><input type="range" min="8" max="150" value={getActiveStyle('size')} onChange={(e) => updateStyle('size', parseInt(e.target.value))} className="w-24 accent-blue-600 h-1" /></div>
                                    <div className="flex items-center justify-between"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Color</label><button onClick={() => { setShowColorModal(true); setShowFontModal(false); setShowCustomSizeModal(false); setShowVisibilityModal(false); }} className="w-32 h-7 flex items-center gap-2 px-2 bg-slate-50 border border-slate-100 rounded hover:bg-slate-100 transition-all shadow-sm"><div className="w-3 h-3 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: getActiveStyle('color') }} /><span className="text-[10px] font-mono font-bold text-slate-600 truncate">{getActiveStyle('color')?.toUpperCase()}</span></button></div>
                                </div>
                                <div className="h-[1px] bg-gray-50" />
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2"><Maximize2 size={12} className="text-blue-500" /><label className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Layout Spacing</label></div>
                                    <div className="space-y-4 p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><MoveVertical size={10}/> Line Space</span>
                                                <div className="flex items-center gap-1.5"><input type="number" value={rowSpacing} onChange={(e) => setRowSpacing(parseInt(e.target.value) || 0)} className="w-10 h-5 bg-white border border-slate-200 rounded text-[9px] font-bold text-blue-600 text-center outline-none focus:border-blue-300 shadow-sm"/><span className="text-[8px] font-black text-slate-300">PX</span></div>
                                            </div>
                                            <input type="range" min="2" max="50" value={rowSpacing} onChange={(e) => setRowSpacing(parseInt(e.target.value))} className="w-full h-1 accent-blue-600 bg-slate-200 rounded-lg cursor-pointer" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><MoveHorizontal size={10}/> Col Space</span>
                                                <div className="flex items-center gap-1.5"><input type="number" value={colSpacing} onChange={(e) => setColSpacing(parseInt(e.target.value) || 0)} className="w-10 h-5 bg-white border border-slate-200 rounded text-[9px] font-bold text-blue-600 text-center outline-none focus:border-blue-300 shadow-sm"/><span className="text-[8px] font-black text-slate-300">PX</span></div>
                                            </div>
                                            <input type="range" min="4" max="80" value={colSpacing} onChange={(e) => setColSpacing(parseInt(e.target.value))} className="w-full h-1 accent-blue-600 bg-slate-200 rounded-lg cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[1px] bg-gray-50" />
                                <div className="space-y-2">
                                    <button onClick={() => { setShowVisibilityModal(true); setShowSettings(false); setShowFontModal(false); setShowColorModal(false); setShowCustomSizeModal(false); }} className="w-full h-10 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100">
                                        <LayoutTemplate size={14} /> Visibility Hub
                                    </button>
                                </div>
                                <div className="h-[1px] bg-gray-50" />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Page Size</label><div className="flex gap-1">{['A4', 'A3', 'Custom'].map(s => ( <button key={s} onClick={() => { setReportSize(s); if(s === 'Custom') { setShowCustomSizeModal(true); setShowFontModal(false); setShowColorModal(false); setShowVisibilityModal(false); } }} className={`px-2 h-6 text-[9px] font-bold rounded border transition-all ${reportSize === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-gray-100'}`}>{s}</button> ))}</div></div>
                                    <div className="flex items-center justify-between"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Signature</label><div className="flex gap-1">{['dotted', 'solid'].map(style => ( <button key={style} onClick={() => setSignatureStyle(style)} className={`px-2 h-6 text-[9px] font-bold rounded border transition-all uppercase ${signatureStyle === style ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-gray-100'}`}>{style}</button> ))}</div></div>
                                </div>
                                <div className="pt-2"><button onClick={() => setWorkspaceTheme(workspaceTheme === 'classic' ? 'modern' : 'classic')} className="w-full h-8 text-[10px] font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-all border border-slate-100">SWITCH THEME</button></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Workspace */}
            <div className="report-workspace no-scrollbar relative z-10" onClick={(e) => { if(e.target === e.currentTarget) setActiveCell(null); }}>
                <div className="print-area animate-in fade-in zoom-in-95 duration-300">
                    <div className={`absolute top-8 right-8 text-right no-print-timestamp ${!showTimestamp ? 'hidden' : ''}`}> <span className="text-[11px] font-medium text-gray-500 tracking-tight">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span> </div>
                    <div className={`pb-6 mb-10 transition-all ${!showCompanyInfo && !showReportTitle ? 'hidden' : ''}`}>
                        {showCompanyInfo && ( <div className="animate-in slide-in-from-top-2 duration-300 relative group"><h1 contentEditable={!hiddenCells.includes('company_name')} suppressContentEditableWarning={true} onClick={() => { setActiveCell({ rowIndex: 'special', columnKey: 'company_name' }); setStyleMode('selection'); }} onBlur={(e) => handleCellBlur('company_name', e)} className={`cursor-text transition-all outline-none leading-none ${activeCell?.columnKey === 'company_name' ? 'cell-selected' : ''} ${hiddenCells.includes('company_name') ? 'cell-hidden' : ''}`} style={getSpecialStyle('company_name', { color: fontColor, fontSize: '36px', fontWeight: '900', letterSpacing: '-0.05em' })}>{hiddenCells.includes('company_name') ? '' : (editedCells['company_name'] || companyName)}</h1><p contentEditable={!hiddenCells.includes('company_address')} suppressContentEditableWarning={true} onClick={() => { setActiveCell({ rowIndex: 'special', columnKey: 'company_address' }); setStyleMode('selection'); }} onBlur={(e) => handleCellBlur('company_address', e)} className={`mt-2 cursor-text transition-all outline-none uppercase tracking-[0.2em] ${activeCell?.columnKey === 'company_address' ? 'cell-selected' : ''} ${hiddenCells.includes('company_address') ? 'cell-hidden' : ''}`} style={getSpecialStyle('company_address', { color: '#64748b', fontSize: '13px', fontWeight: '700' })}>{hiddenCells.includes('company_address') ? '' : (editedCells['company_address'] || companyAddress)}</p></div> )}
                        {showReportTitle && ( <div onClick={() => { setActiveCell({ rowIndex: 'special', columnKey: 'report_title' }); setStyleMode('selection'); }} className={`mt-6 inline-block px-5 py-2 shadow-sm animate-in slide-in-from-top-1 duration-300 cursor-text transition-all ${activeCell?.columnKey === 'report_title' ? 'cell-selected' : ''} ${hiddenCells.includes('report_title') ? 'opacity-0 pointer-events-none' : ''}`} style={{ backgroundColor: getSpecialStyle('report_title', { color: '#ffffff' }).backgroundColor || fontColor }}><span contentEditable={!hiddenCells.includes('report_title')} suppressContentEditableWarning={true} onBlur={(e) => handleCellBlur('report_title', e)} className="text-[14px] font-black uppercase tracking-[0.3em] outline-none" style={getSpecialStyle('report_title', { color: '#ffffff', fontSize: '14px' })}>{hiddenCells.includes('report_title') ? '' : (editedCells['report_title'] || title)}</span></div> )}
                    </div>
                    <div className="min-h-[400px] mt-[-40px]">
                        <table className="w-full border-collapse">
                            <thead><tr className="border-y-2 border-slate-900 bg-slate-50/50" style={{ borderColor: fontColor }}>{visibleColumns.map((col, idx) => { const headerKey = `header_${col.key}`; const isSelected = activeCell?.rowIndex === 'special' && activeCell?.columnKey === headerKey; return ( <th key={idx} contentEditable={true} suppressContentEditableWarning={true} onClick={() => { setActiveCell({ rowIndex: 'special', columnKey: headerKey }); setStyleMode('selection'); }} onBlur={(e) => handleCellBlur(headerKey, e)} className={`py-3 px-4 text-[11px] font-black uppercase tracking-widest cursor-text transition-all outline-none ${isSelected ? 'cell-selected' : ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`} style={{ ...getSpecialStyle(headerKey, { color: fontColor, fontSize: '11px', fontWeight: '900' }), paddingTop: `${rowSpacing}px`, paddingBottom: `${rowSpacing}px`, paddingLeft: `${colSpacing/2}px`, paddingRight: `${colSpacing/2}px` }}>{editedCells[headerKey] || col.header}</th> ); })}</tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentData && currentData.length > 0 ? currentData.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">{visibleColumns.map((col, colIdx) => { const cellKey = `${startIndex + rowIdx}_${col.key}`; const style = cellStyles[cellKey] || {}; const isSelected = activeCell?.rowIndex === (startIndex + rowIdx) && activeCell?.columnKey === col.key; const isHidden = hiddenCells.includes(cellKey); const originalVal = col.format ? col.format(row[col.key], row) : row[col.key]; const currentVal = editedCells[cellKey] !== undefined ? editedCells[cellKey] : originalVal; return ( <td key={colIdx} contentEditable={!isHidden} suppressContentEditableWarning={true} onFocus={() => { setActiveCell({ rowIndex: startIndex + rowIdx, columnKey: col.key }); setStyleMode('selection'); }} onBlur={(e) => handleCellBlur(cellKey, e)} className={`transition-all cursor-text dynamic-report-text editable-cell ${isSelected ? 'cell-selected' : ''} ${isHidden ? 'cell-hidden' : ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`} style={{ color: isHidden ? 'transparent' : (style.color || undefined), fontSize: style.size ? `${style.size}px` : undefined, fontWeight: style.bold !== undefined ? (style.bold ? 'bold' : 'normal') : undefined, fontStyle: style.italic !== undefined ? (style.italic ? 'italic' : 'normal') : undefined, textDecoration: style.underline !== undefined ? (style.underline ? 'underline' : 'none') : undefined, fontFamily: style.family || undefined, paddingTop: `${rowSpacing}px`, paddingBottom: `${rowSpacing}px`, paddingLeft: `${colSpacing/2}px`, paddingRight: `${colSpacing/2}px` }}>{isHidden ? '' : currentVal}</td> ); })}</tr>
                                )) : ( <tr><td colSpan={visibleColumns.length} className="py-32 text-center text-slate-300 text-[14px] font-black uppercase tracking-[0.5em]">Void Dataset</td></tr> )}
                            </tbody>
                        </table>
                    </div>
                    <div className={`mt-16 pt-10 border-t border-slate-100 flex justify-between items-end ${!showSignatures && !showPageNumbers ? 'hidden' : ''}`}>
                        <div className={`${!showSignatures ? 'opacity-0 pointer-events-none' : ''}`}><div className={`w-64 mb-1 ${signatureStyle === 'solid' ? 'h-[1.5px]' : 'border-b-[2px] border-dotted'}`} style={{ backgroundColor: signatureStyle === 'solid' ? fontColor : 'transparent', borderColor: fontColor }}></div><p className="text-[9px] font-bold text-slate-300 uppercase mt-2 italic">Validation required</p></div>
                        <div className={`text-right ${!showPageNumbers ? 'opacity-0' : ''}`}> <span className="text-[11px] font-medium text-gray-400 tracking-tight">Page {currentPage} / {totalPages || 1}</span> </div>
                    </div>
                </div>
            </div>

            <div className="h-8 bg-white border-t border-slate-200 flex items-center px-6 no-print shrink-0 gap-10 shadow-sm z-50 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
                <div>Format: <span className="text-slate-700">{reportSize}</span></div>
                <div className="flex items-center gap-4"><div className="flex items-center gap-1.5 text-blue-600"><FileText size={10}/> INTERACTIVE</div><div className="flex items-center gap-1.5 text-slate-600"><Columns size={10}/> {visibleColumns.length} COLS</div><div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-tighter"><Maximize2 size={10}/> {rowSpacing}x{colSpacing} GAP</div></div>
                <div className="ml-auto">Engine v4.3</div>
            </div>
        </div>
    );
};

export default ReportTemplate;
