import React, { useEffect, useState } from 'react';
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
    Settings2
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
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLandscape, setIsLandscape] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [workspaceTheme, setWorkspaceTheme] = useState('classic'); // 'classic' or 'modern'
    const [signatureStyle, setSignatureStyle] = useState('dotted'); // 'solid' or 'dotted'
    const [pagePadding, setPagePadding] = useState('10mm');
    const pageSize = isLandscape ? 20 : 30; // Fewer items per page in landscape

    // Filter data based on search
    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = filteredData.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        document.title = `${title} - ${companyName}`;
    }, [title, companyName]);

    const handlePrint = () => {
        window.print();
    };

    const handleFirstPage = () => setCurrentPage(1);
    const handleLastPage = () => setCurrentPage(totalPages);
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    return (
        <div className={`fixed inset-0 flex flex-col font-['Tahoma'] select-none overflow-hidden transition-colors duration-500 ${workspaceTheme === 'classic' ? 'bg-[#808080]' : 'bg-slate-100'}`}>
            <style>
                {`
                    @media print {
                        @page {
                            size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
                            margin: 0;
                        }
                        body {
                            background: white !important;
                            margin: 0;
                            padding: 0;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .print-area {
                            box-shadow: none !important;
                            border: none !important;
                            margin: 0 !important;
                            width: ${isLandscape ? '297mm' : '210mm'} !important;
                            min-height: ${isLandscape ? '210mm' : '297mm'} !important;
                            padding: 8mm !important;
                            transform: none !important;
                        }
                    }
                    
                    .report-workspace {
                        flex: 1;
                        overflow: auto;
                        padding: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .print-area {
                        width: ${isLandscape ? '297mm' : '210mm'};
                        min-height: ${isLandscape ? '210mm' : '297mm'};
                        background: white;
                        padding: ${pagePadding};
                        box-shadow: ${workspaceTheme === 'classic' ? '10px 10px 5px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.1)'};
                        position: relative;
                        box-sizing: border-box;
                        transition: all 0.3s ease;
                        flex-shrink: 0;
                        margin-bottom: 40px;
                    }

                    .tab-active {
                        background: white;
                        border-top: 2px solid #0054a6;
                        color: #0054a6;
                        font-weight: bold;
                    }

                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}
            </style>

            {/* Top Modern Toolbar (No-Print) */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 no-print shrink-0 shadow-sm z-[100]">
                
                {/* Action Group */}
                <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
                    <button 
                        onClick={handlePrint} 
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-blue-600" 
                        title="Print"
                    >
                        <Printer size={18} />
                    </button>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-emerald-600" 
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button 
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-orange-600" 
                        title="Export"
                    >
                        <Download size={16} />
                    </button>
                    <button 
                        onClick={() => {
                            setIsLandscape(!isLandscape);
                            setCurrentPage(1);
                        }} 
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${isLandscape ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600 hover:text-indigo-600'}`}
                        title={isLandscape ? "Switch to Portrait" : "Switch to Landscape"}
                    >
                        {isLandscape ? <Monitor size={18} /> : <Smartphone size={18} />}
                    </button>
                </div>

                {/* Navigation Group */}
                <div className="flex items-center gap-1 border-r border-slate-200 px-4">
                    <button 
                        onClick={handleFirstPage} 
                        disabled={currentPage === 1} 
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1} 
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center gap-2 mx-3">
                        <input 
                            type="text" 
                            value={currentPage}
                            className="w-12 h-8 bg-slate-50 border border-slate-200 rounded-md text-center text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            readOnly
                        />
                        <span className="text-sm font-bold text-slate-400 whitespace-nowrap">/ {totalPages || 1}</span>
                    </div>

                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages} 
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button 
                        onClick={handleLastPage} 
                        disabled={currentPage === totalPages} 
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-600"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>

                {/* Modern Search */}
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                        type="text"
                        placeholder=""
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-[5px] text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    />
                </div>

                {/* Branding & Settings */}
                <div className="ml-auto flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end border-r border-slate-200 pr-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Advanced Reporting Engine</span>
                        <span className="text-[14px] font-black text-slate-900 tracking-tighter uppercase leading-none">Onimta</span>
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${showSettings ? 'bg-slate-100 text-blue-600 shadow-inner' : 'hover:bg-slate-100 text-slate-400'}`}
                        >
                            <Settings2 size={20} className={showSettings ? 'rotate-90 duration-300' : 'duration-300'} />
                        </button>

                        {showSettings && (
                            <div className="absolute top-12 right-0 w-64 bg-white border border-slate-200 shadow-2xl rounded-[5px] p-4 z-[110] animate-in slide-in-from-top-2 duration-200">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Report Personalization</h3>
                                
                                <div className="space-y-4">
                                    {/* Workspace Theme */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Workspace Theme</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => setWorkspaceTheme('classic')}
                                                className={`py-1.5 text-[10px] font-bold rounded border transition-all ${workspaceTheme === 'classic' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Classic Grey
                                            </button>
                                            <button 
                                                onClick={() => setWorkspaceTheme('modern')}
                                                className={`py-1.5 text-[10px] font-bold rounded border transition-all ${workspaceTheme === 'modern' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Modern White
                                            </button>
                                        </div>
                                    </div>

                                    {/* Signature Style */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Signature Style</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => setSignatureStyle('solid')}
                                                className={`py-1.5 text-[10px] font-bold rounded border transition-all ${signatureStyle === 'solid' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Solid Line
                                            </button>
                                            <button 
                                                onClick={() => setSignatureStyle('dotted')}
                                                className={`py-1.5 text-[10px] font-bold rounded border transition-all ${signatureStyle === 'dotted' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Dotted Line
                                            </button>
                                        </div>
                                    </div>

                                    {/* Padding Style */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Page Padding</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => setPagePadding('20mm')}
                                                className={`py-1.5 text-[10px] font-bold rounded border transition-all ${pagePadding === '20mm' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Normal
                                            </button>
                                            <button 
                                                onClick={() => setPagePadding('10mm')}
                                                className={`py-1.5 text-[10px] font-bold rounded border transition-all ${pagePadding === '10mm' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Slim
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

         {/* Report Workspace */}
            <div className="report-workspace no-scrollbar relative">
                <div className="print-area animate-in fade-in zoom-in-95 duration-300">
                    {/* Absolute Timestamp */}
                    <div className="absolute top-8 right-8 text-right no-print-timestamp">
                        <span className="text-[11px] font-medium text-gray-500 tracking-tight">
                            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                    </div>

                    {/* Report Header */}
                    <div className="pb-6 mb-10">
                        <div>
                            <h1 className="text-[32px] font-black text-slate-900 tracking-tighter leading-none">{companyName}</h1>
                            <p className="text-[13px] font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">{companyAddress}</p>
                            <div className="mt-6 inline-block bg-slate-900 text-white px-5 py-2 shadow-sm">
                                <span className="text-[14px] font-black uppercase tracking-[0.3em]">{title}</span>
                            </div>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className="min-h-[400px] mt-[-40px]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-y-2 border-slate-900 bg-slate-50/50">
                                    {columns.map((col, idx) => (
                                        <th key={idx} className={`py-3 px-4 text-[11px] font-black text-slate-900 uppercase tracking-widest ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentData && currentData.length > 0 ? currentData.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`py-2 px-4 text-[13px] font-medium text-slate-700 ${col.align === 'right' ? 'text-right font-mono font-bold' : 'text-left'}`}>
                                                {col.format ? col.format(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={columns.length} className="py-32 text-center text-slate-300 text-[14px] font-black uppercase tracking-[0.5em]">
                                            {searchTerm ? "No results found" : "Void Dataset"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Report Footer */}
                    <div className="mt-16 pt-10 border-t border-slate-100 flex justify-between items-end">
                        <div>
                            <div className={`w-64 mb-1 ${signatureStyle === 'solid' ? 'h-[1.5px] bg-slate-900' : 'border-b-[2px] border-dotted border-slate-900'}`}></div>
                            <p className="text-[9px] font-bold text-slate-300 uppercase mt-2 italic">Validation required</p>
                        </div>
                    </div>

                    {/* Absolute Page Counter */}
                    <div className="absolute bottom-8 right-8 text-right">
                        <span className="text-[11px] font-medium text-gray-500 tracking-tight">
                            Page {currentPage} / {totalPages || 1}
                        </span>
                    </div>
                </div>
            </div>

            {/* Modern Status Bar (No-Print) */}
            <div className="h-8 bg-white border-t border-slate-200 flex items-center px-6 no-print shrink-0 gap-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
                <div className="flex items-center gap-2 border-r border-slate-100 pr-10 h-full">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Page</span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{currentPage}</span>
                </div>
                <div className="flex items-center gap-2 border-r border-slate-100 pr-10 h-full">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Dataset Volume</span>
                    <span className="text-xs font-bold text-slate-700">{totalPages || 1} Pages</span>
                </div>
                <div className="ml-auto flex items-center gap-4">

                    <div className="text-[11px] font-bold text-slate-400 border-l border-slate-200 pl-4">
                        Zoom: <span className="text-slate-900">100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportTemplate;
