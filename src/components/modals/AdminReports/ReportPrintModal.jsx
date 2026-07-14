import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronDown, Menu, Minus, Plus, Maximize, RotateCw, Hand, Undo, Redo, Download, Printer, MoreVertical, Check } from 'lucide-react';
import { getCompanyDetails, getCompanyName } from '../../../utils/session';

const ReportPrintModal = ({ isOpen, onClose, companyName, title, subtitle, data = [], columns = [], totals = null }) => {
    const [orientation, setOrientation] = useState('Portrait');
    const [scaling, setScaling] = useState('Smart page break');
    const [showHeaders, setShowHeaders] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);
    
    // Toolbar state
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
    
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showDocProps, setShowDocProps] = useState(false);
    const [isTwoPageView, setIsTwoPageView] = useState(false);
    const [showAnnotations, setShowAnnotations] = useState(true);
    const [showSignatures, setShowSignatures] = useState(true);
    const [showPageInfo, setShowPageInfo] = useState(true);
    
    const scrollContainerRef = React.useRef(null);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleUndo = () => { setZoom(100); setRotation(0); };
    
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleMouseDown = (e) => {
        if (!isPanning) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        if (scrollContainerRef.current) {
            setScrollStart({
                x: scrollContainerRef.current.scrollLeft,
                y: scrollContainerRef.current.scrollTop
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !isPanning || !scrollContainerRef.current) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        scrollContainerRef.current.scrollLeft = scrollStart.x - dx;
        scrollContainerRef.current.scrollTop = scrollStart.y - dy;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isOpen) return null;

    // Auto-generate columns from data keys if no columns prop provided
    const resolvedColumns = (columns && columns.length > 0)
        ? columns
        : (data && data.length > 0)
            ? Object.keys(data[0]).map(key => ({ header: key, accessor: key }))
            : [];

    const formatCell = (col, row) => {
        const val = row[col.accessor || col.key];
        if (col.format) return col.format(val);
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
            return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
        }
        return String(val);
    };

    const maxNormalRows = orientation === 'Portrait' ? 30 : 18;
    const maxLastRows = orientation === 'Portrait' ? 25 : 14;

    const chunks = [];
    if (!data || data.length === 0) {
        chunks.push([]);
    } else {
        let remaining = [...data];
        while (remaining.length > 0) {
            if (remaining.length <= maxLastRows) {
                chunks.push(remaining);
                remaining = [];
            } else if (remaining.length <= maxNormalRows) {
                const take = remaining.length - 1;
                chunks.push(remaining.slice(0, take));
                remaining = remaining.slice(take);
            } else {
                chunks.push(remaining.slice(0, maxNormalRows));
                remaining = remaining.slice(maxNormalRows);
            }
        }
    }

    const compDetails = getCompanyDetails();
    const finalCompanyName = getCompanyName() || companyName || 'ONIMTA INFORMATION TECHNOLOGY';
    const finalTaxId = compDetails?.taxID || compDetails?.Tax_ID || compDetails?.TaxID || compDetails?.regNumber || compDetails?.Reg_Number || 'N/A';
    const finalAddress = compDetails?.address1 ? `${compDetails.address1}${compDetails.address2 ? `, ${compDetails.address2}` : ''}${compDetails.country ? `, ${compDetails.country}` : ''}` : 'N/A';

    const HeaderContent = (
        <div style={{ marginBottom: showHeaders ? '0' : '20px', borderBottom: '2px solid #000', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{subtitle}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', color: '#000' }}>{finalCompanyName}</div>
                    <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>Business Registration / Tax ID: {finalTaxId}</div>
                    <div style={{ fontSize: '10px', color: '#444' }}>{finalAddress}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#444' }}>
                    <div><strong>Printed:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                    <div style={{ marginTop: '2px' }}><strong>User:</strong> System Admin</div>
                    <div style={{ marginTop: '2px' }}><strong>Status:</strong> Final / Approved</div>
                </div>
            </div>
        </div>
    );

    // The printable document — rendered via Portal directly onto body to escape overflow-hidden parents
    const PrintDocument = ReactDOM.createPortal(
        <div
            id="report-print-document"
            className="print-only"
            style={{
                display: 'none',  // hidden in normal view; CSS makes it visible on print
                backgroundColor: 'white',
                fontFamily: "'Tahoma', Arial, sans-serif",
            }}
        >
            <style>
                {`
                @media print {
                    @page { 
                        margin: 0; 
                        size: ${orientation === 'Landscape' ? 'landscape' : 'portrait'};
                    }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    #report-print-document { 
                        display: block !important; 
                    }
                    .print-content-wrapper {
                        display: block;
                    }
                    .print-footer-wrapper {
                        margin-top: 40px;
                        page-break-inside: avoid;
                    }
                    table { page-break-inside: auto; width: 100%; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                }
                `}
            </style>

            <div className="print-content-wrapper">
                {chunks.map((chunk, pageIndex) => (
                    <div key={pageIndex} style={{ 
                        position: 'relative',
                        padding: '10mm 20px', 
                        boxSizing: 'border-box',
                        height: orientation === 'Portrait' ? '275mm' : '195mm',
                        pageBreakAfter: pageIndex < chunks.length - 1 ? 'always' : 'auto' 
                    }}>
                        {(!showHeaders && pageIndex === 0) && HeaderContent}
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: '#000' }}>
                            <thead>
                                {(showHeaders || pageIndex === 0) && (
                                    <tr>
                                        <td colSpan={resolvedColumns.length} style={{ paddingBottom: '20px', borderBottom: 'none' }}>
                                            {HeaderContent}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    {resolvedColumns.map((col, i) => (
                                        <th key={i} style={{ padding: '6px 6px', textAlign: col.align || 'left', fontWeight: 'bold', color: '#000', borderBottom: '1px solid #000', borderTop: '1px solid #000', textTransform: 'uppercase' }}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chunk.length === 0 ? (
                                    <tr><td colSpan={resolvedColumns.length} style={{ padding: '30px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>No data available</td></tr>
                                ) : chunk.map((row, i) => (
                                    <tr key={i} style={{ backgroundColor: i % 2 === 1 ? '#fafafa' : 'white' }}>
                                        {resolvedColumns.map((col, j) => (
                                            <td key={j} style={{ padding: '4px 6px', textAlign: col.align || 'left', color: '#000', borderBottom: '1px solid #eee' }}>
                                                {formatCell(col, row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            {totals && pageIndex === chunks.length - 1 && (
                                <tbody style={{ borderTop: '1px solid #000', borderBottom: '3px double #000' }}>
                                    <tr>
                                        {resolvedColumns.map((col, j) => {
                                            const accessor = col.accessor || col.key;
                                            const isFirstCol = j === 0;
                                            return (
                                                <td key={j} style={{ padding: '6px 6px', textAlign: col.align || 'left', fontWeight: 'bold', color: '#000' }}>
                                                    {isFirstCol ? 'TOTAL' : (totals[accessor] !== undefined ? col.format ? col.format(totals[accessor]) : totals[accessor] : '')}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            )}
                        </table>

                        {(showSignatures || showPageInfo) && (
                            <div className="print-footer-wrapper" style={{ position: 'absolute', bottom: '10mm', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '10px', backgroundColor: '#fff' }}>
                                <div style={{ width: '33%', textAlign: 'left' }}>
                                    {showSignatures && pageIndex === chunks.length - 1 && (
                                        <div style={{ width: '180px' }}>
                                            <div style={{ borderBottom: '1px dashed #64748b', height: '40px', marginBottom: '8px', width: '100%' }}></div>
                                            <span style={{ color: '#475569', display: 'block', textAlign: 'center', fontWeight: '600', fontSize: '10px' }}>Prepared By</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ width: '33%', display: 'flex', justifyContent: 'center' }}>
                                    {showSignatures && pageIndex === chunks.length - 1 && (
                                        <div style={{ width: '180px' }}>
                                            <div style={{ borderBottom: '1px dashed #64748b', height: '40px', marginBottom: '8px', width: '100%' }}></div>
                                            <span style={{ color: '#475569', display: 'block', textAlign: 'center', fontWeight: '600', fontSize: '10px' }}>Approved By</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ width: '33%', color: '#64748b', textAlign: 'right' }}>
                                    {showPageInfo && (
                                        <div style={{ fontWeight: '500', fontSize: '10px' }}>
                                            {pageIndex === chunks.length - 1 && (
                                                <>
                                                    <span>Printed on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                                                    <br/>
                                                    <span style={{ marginTop: '4px', display: 'inline-block' }}>{data.length} record{data.length !== 1 ? 's' : ''}</span>
                                                    <br/>
                                                </>
                                            )}
                                            <span style={{ marginTop: '8px', display: 'inline-block', color: '#444', fontWeight: 'bold' }}>Page {pageIndex + 1} of {chunks.length}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>,
        document.body
    );

    return (
        <>
            {/* Portal-rendered print document (invisible on screen, shows on print) */}
            {PrintDocument}

            {/* Modal UI */}
            <div className={`fixed inset-0 z-[1500] flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 backdrop-blur-sm ${isFullscreen ? 'p-0' : 'p-4'}`}>
                <div className={`bg-white ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-[1320px] h-[90vh] rounded-sm'} shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Print or save as PDF</h2>
                            <p className="text-[13px] text-gray-500 mt-1">Click <strong>Print</strong> to open the browser print dialog. Choose "Save as PDF" as destination to download.</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-[3px] transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Sidebar - Settings */}
                        {showSidebar && (
                            <div className="w-[280px] bg-[#f4f5f8] p-6 border-r border-gray-200 shrink-0 overflow-y-auto transition-all animate-in slide-in-from-left-4 duration-300">
                                <h3 className="text-[14px] font-bold text-gray-900 mb-4">Report Print Settings</h3>
                            
                            <div className="space-y-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] text-gray-500 font-medium">Orientation</label>
                                    <div className="relative">
                                        <select 
                                            value={orientation}
                                            onChange={(e) => setOrientation(e.target.value)}
                                            className="appearance-none w-full h-[38px] px-3 border border-gray-300 rounded-[3px] text-[13px] text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer shadow-sm"
                                        >
                                            <option>Portrait</option>
                                            <option>Landscape</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] text-gray-500 font-medium">Scaling</label>
                                    <div className="relative">
                                        <select 
                                            value={scaling}
                                            onChange={(e) => setScaling(e.target.value)}
                                            className="appearance-none w-full h-[38px] px-3 border border-gray-300 rounded-[3px] text-[13px] text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer shadow-sm"
                                        >
                                            <option>Smart page break</option>
                                            <option>Fit to page width</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer mt-2">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={showHeaders}
                                            onChange={(e) => setShowHeaders(e.target.checked)}
                                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[2px] checked:bg-[#0077c5] checked:border-[#0077c5] cursor-pointer transition-colors"
                                        />
                                        <div className="absolute text-slate-800 dark:text-white pointer-events-none opacity-0 peer-checked:opacity-100">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-[13px] text-gray-700">Show report headers on all pages</span>
                                </label>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-[12px] text-gray-500 font-medium mb-1">Report Summary</p>
                                    <p className="text-[12px] text-gray-700 font-bold">{title}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{companyName}</p>
                                    <p className="text-[11px] text-gray-400 mt-1">{data.length} row{data.length !== 1 ? 's' : ''} of data</p>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Right Area - Preview */}
                        <div className="flex-1 bg-[#323639] flex flex-col relative overflow-hidden">
                            {/* Toolbar */}
                            <div className="h-12 bg-[#323639] border-b border-gray-700 flex items-center justify-between px-4 shrink-0 text-gray-300 shadow-md z-10">
                                <div className="flex items-center gap-4">
                                    <button 
                                        className={`p-1.5 rounded transition-colors ${showSidebar ? 'bg-slate-200 dark:bg-white/10 hover:bg-white/20' : 'hover:bg-slate-200 dark:bg-white/10'}`}
                                        onClick={() => setShowSidebar(!showSidebar)}
                                        title="Toggle Sidebar"
                                    >
                                        <Menu size={16} />
                                    </button>
                                    <span className="text-[13px] font-medium truncate w-[240px] text-gray-200">{title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-slate-200 dark:bg-white/10 rounded px-2 h-7 text-[12px]">
                                        <span className="font-bold text-slate-800 dark:text-white">1</span>
                                        <span className="mx-1">/</span>
                                        <span>1</span>
                                    </div>
                                    <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                    <button onClick={handleZoomOut} className="hover:bg-slate-200 dark:bg-white/10 p-1.5 rounded" title="Zoom Out"><Minus size={16} /></button>
                                    <span className="text-[12px] font-bold w-10 text-center">{zoom}%</span>
                                    <button onClick={handleZoomIn} className="hover:bg-slate-200 dark:bg-white/10 p-1.5 rounded" title="Zoom In"><Plus size={16} /></button>
                                    <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                    <button onClick={toggleFullscreen} className={`p-1.5 rounded ${isFullscreen ? 'bg-white/20' : 'hover:bg-slate-200 dark:bg-white/10'}`} title="Fullscreen"><Maximize size={16} /></button>
                                    <button onClick={handleRotate} className="hover:bg-slate-200 dark:bg-white/10 p-1.5 rounded" title="Rotate"><RotateCw size={16} /></button>
                                    <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                    <button onClick={() => setIsPanning(!isPanning)} className={`p-1.5 rounded ${isPanning ? 'bg-[#0077c5] text-white' : 'hover:bg-slate-200 dark:bg-white/10'}`} title="Pan Tool"><Hand size={16} /></button>
                                    <button onClick={handleUndo} className="hover:bg-slate-200 dark:bg-white/10 p-1.5 rounded" title="Reset View"><Undo size={16} /></button>
                                    <button className="hover:bg-slate-200 dark:bg-white/10 p-1.5 rounded opacity-50 cursor-not-allowed" title="Redo"><Redo size={16} /></button>
                                </div>
                                <div className="flex items-center gap-2 relative">
                                    <button className="hover:bg-slate-200 dark:bg-white/10 p-1.5 rounded" onClick={() => window.print()}><Download size={16} /></button>
                                    <button className="hover:bg-slate-200 dark:bg-white/10 p-1.5 rounded" onClick={() => window.print()}><Printer size={16} /></button>
                                    <button 
                                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                                        className={`p-1.5 rounded transition-colors ${showMoreMenu ? 'bg-white/20' : 'hover:bg-slate-200 dark:bg-white/10'}`}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    
                                    {showMoreMenu && (
                                        <>
                                            <div className="fixed inset-0 z-[1510]" onClick={() => setShowMoreMenu(false)}></div>
                                            <div className="absolute top-[110%] right-0 mt-1 w-56 bg-[#2b2d2f] rounded-sm shadow-xl border border-gray-700 py-1.5 z-[1520] text-[#e8eaed] text-[13px]">
                                                <button 
                                                    onClick={() => { setIsTwoPageView(!isTwoPageView); setShowMoreMenu(false); }}
                                                    className="w-full text-left px-4 py-2 hover:bg-[#3c4043] transition-colors flex items-center"
                                                >
                                                    {isTwoPageView ? <Check size={14} className="mr-2.5" /> : <span className="ml-6"></span>}
                                                    <span>Two page view</span>
                                                </button>
                                                <button 
                                                    onClick={() => { setShowAnnotations(!showAnnotations); setShowMoreMenu(false); }}
                                                    className="w-full text-left px-4 py-2 hover:bg-[#3c4043] transition-colors flex items-center"
                                                >
                                                    {showAnnotations ? <Check size={14} className="mr-2.5" /> : <span className="ml-6"></span>}
                                                    <span>Annotations</span>
                                                </button>
                                                <button 
                                                    onClick={() => { setShowSignatures(!showSignatures); setShowMoreMenu(false); }}
                                                    className="w-full text-left px-4 py-2 hover:bg-[#3c4043] transition-colors flex items-center"
                                                >
                                                    {showSignatures ? <Check size={14} className="mr-2.5" /> : <span className="ml-6"></span>}
                                                    <span>Signatures (Prepared/Approved)</span>
                                                </button>
                                                <button 
                                                    onClick={() => { setShowPageInfo(!showPageInfo); setShowMoreMenu(false); }}
                                                    className="w-full text-left px-4 py-2 hover:bg-[#3c4043] transition-colors flex items-center"
                                                >
                                                    {showPageInfo ? <Check size={14} className="mr-2.5" /> : <span className="ml-6"></span>}
                                                    <span>Page Info</span>
                                                </button>
                                                <div className="h-px bg-gray-700 my-1.5 mx-1"></div>
                                                <button className="w-full text-left px-4 py-2 hover:bg-[#3c4043] transition-colors flex items-center opacity-50 cursor-not-allowed">
                                                    <span className="ml-6">Present</span>
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 hover:bg-[#3c4043] transition-colors flex items-center"
                                                    onClick={() => {
                                                        setShowMoreMenu(false);
                                                        setShowDocProps(true);
                                                    }}
                                                >
                                                    <span className="ml-6">Document properties</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div 
                                ref={scrollContainerRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className={`flex-1 overflow-auto bg-[#525659] p-8 flex ${isTwoPageView ? 'justify-start gap-8' : 'justify-center'} custom-scrollbar ${isPanning ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                                style={{ fontFamily: "'Tahoma', Arial, sans-serif" }}
                            >
                                {/* This is a VISUAL PREVIEW only — the actual print comes from the Portal above */}
                                <div 
                                    className="transition-transform duration-200 ease-out origin-top flex flex-col items-center"
                                    style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
                                >
                                    {showAnnotations && (
                                        <div className="absolute top-16 right-16 bg-yellow-200/90 text-yellow-900 p-3 shadow-lg rounded-sm border border-yellow-300 w-48 text-[12px] font-medium rotate-2 z-50">
                                            ✏️ Annotation Note:<br/>
                                            Please review these figures before final submission.
                                        </div>
                                    )}

                                    {(() => {
                                        return chunks.map((chunk, pageIndex) => (
                                            <div 
                                                key={pageIndex}
                                                className={`bg-white shadow-2xl shrink-0 flex flex-col p-12 relative ${orientation === 'Portrait' ? 'w-[794px] min-h-[1123px]' : 'w-[1123px] min-h-[794px]'}`}
                                                style={{ marginBottom: '2rem' }}
                                            >
                                                {(showHeaders || pageIndex === 0) && (
                                                    <div className="w-full shrink-0">
                                                        {HeaderContent}
                                                    </div>
                                                )}
                                    <div className="flex-1">
                                        {(!data || data.length === 0) ? (
                                            <div className="text-center text-gray-400 text-sm mt-8 pt-8 border-t border-gray-200">[No Data to Print]</div>
                                        ) : (
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-t border-b border-gray-900">
                                                        {resolvedColumns.map((col, i) => (
                                                            <th key={i} className="px-1.5 py-2 text-[10px] font-bold text-gray-900 uppercase tracking-wider" style={{ textAlign: col.align || 'left' }}>
                                                                {col.header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chunk.map((row, i) => (
                                                        <tr key={i} className={`border-b border-gray-200 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                                                            {resolvedColumns.map((col, j) => (
                                                                <td key={j} className="px-1.5 py-1 text-[11px] text-gray-900" style={{ textAlign: col.align || 'left', wordBreak: 'break-word' }}>
                                                                    {formatCell(col, row)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                {totals && pageIndex === chunks.length - 1 && (
                                                    <tfoot>
                                                        <tr className="border-t border-b-[3px] border-double border-gray-900 bg-white">
                                                            {resolvedColumns.map((col, j) => {
                                                                const accessor = col.accessor || col.key;
                                                                const isFirstCol = j === 0;
                                                                return (
                                                                    <td key={j} className="px-1.5 py-2 text-[11px] font-bold text-gray-900 whitespace-nowrap" style={{ textAlign: col.align || 'left' }}>
                                                                        {isFirstCol ? 'TOTAL' : (totals[accessor] !== undefined ? col.format ? col.format(totals[accessor]) : totals[accessor] : '')}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        )}
                                    </div>
                                    {(showSignatures || showPageInfo) && (
                                        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-end shrink-0 px-5">
                                            <div className="flex-1 flex justify-start">
                                                {showSignatures && pageIndex === chunks.length - 1 && (
                                                    <div className="flex flex-col items-center w-36">
                                                        <div className="w-full border-b border-gray-400 mb-2"></div>
                                                        <span className="text-[10px] text-gray-600 font-medium">Prepared By</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex justify-center">
                                                {showSignatures && pageIndex === chunks.length - 1 && (
                                                    <div className="flex flex-col items-center w-36">
                                                        <div className="w-full border-b border-gray-400 mb-2"></div>
                                                        <span className="text-[10px] text-gray-600 font-medium">Approved By</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex justify-end">
                                                {showPageInfo && (
                                                    <div className="flex flex-col items-end text-[10px] text-gray-400 font-medium text-right">
                                                        {pageIndex === chunks.length - 1 && (
                                                            <>
                                                                <span>Printed on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                                                                <span className="mt-1">{data.length} record{data.length !== 1 ? 's' : ''}</span>
                                                            </>
                                                        )}
                                                        <span className="mt-2 text-gray-500 font-bold">Page {pageIndex + 1} of {chunks.length}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ));
                        })()}
                                </div>
                                
                                {/* Fake 2nd Page for Two Page View */}
                                {isTwoPageView && (
                                    <div 
                                        className={`bg-white shadow-2xl shrink-0 flex flex-col p-12 transition-transform duration-200 ease-out origin-top relative ${orientation === 'Portrait' ? 'w-[794px] min-h-[1123px]' : 'w-[1123px] min-h-[794px]'}`}
                                        style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
                                    >
                                        <div className="flex-1 flex items-center justify-center text-gray-300 text-[14px]">
                                            [Intentionally Blank Page]
                                        </div>
                                        <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end">
                                            <div className="text-[11px] text-gray-400">Page 2 of 2</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0">
                        <button onClick={onClose} className="h-9 px-5 border border-gray-300 text-gray-600 text-[13px] font-medium rounded-[3px] hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={() => window.print()} className="h-9 px-5 border-2 border-[#0077c5] text-[#0077c5] text-[13px] font-bold rounded-[3px] hover:bg-blue-50 transition-colors">
                            Save as PDF
                        </button>
                        <button onClick={() => window.print()} className="h-9 px-5 bg-[#0077c5] hover:bg-[#005ca6] text-white text-[13px] font-bold rounded-[3px] transition-colors shadow-sm">
                            Print
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Properties Modal */}
            {showDocProps && (
                <div className="fixed inset-0 z-[1550] flex items-center justify-center bg-transparent">
                    <div className="absolute inset-0 bg-transparent" onClick={() => setShowDocProps(false)}></div>
                    <div className="bg-[#202124] w-[400px] rounded-[4px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-[1560] border border-gray-700">
                        <div className="p-5 flex flex-col text-[#e8eaed] text-[13px]">
                            <h2 className="text-[15px] mb-4">Document properties</h2>
                            
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">File name:</span>
                                <span className="flex-1 truncate">{title.replace(/\s+/g, '_')}_Report.pdf</span>
                            </div>
                            <div className="flex mb-3">
                                <span className="w-28 font-medium">File size:</span>
                                <span className="flex-1">{(data.length * 0.45).toFixed(1)} KB</span>
                            </div>
                            <div className="h-px bg-gray-700 w-full my-2"></div>
                            
                            <div className="flex mt-2 mb-1">
                                <span className="w-28 font-medium">Title:</span>
                                <span className="flex-1">{title}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">Author:</span>
                                <span className="flex-1">{companyName}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">Subject:</span>
                                <span className="flex-1">-</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">Keywords:</span>
                                <span className="flex-1">-</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">Created:</span>
                                <span className="flex-1">{new Date().toLocaleString()}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">Modified:</span>
                                <span className="flex-1">-</span>
                            </div>
                            <div className="flex mb-3">
                                <span className="w-28 font-medium">Application:</span>
                                <span className="flex-1">Onimta Web Application</span>
                            </div>
                            <div className="h-px bg-gray-700 w-full my-2"></div>

                            <div className="flex mt-2 mb-1">
                                <span className="w-28 font-medium">PDF producer:</span>
                                <span className="flex-1">Browser Engine</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">PDF version:</span>
                                <span className="flex-1">1.7</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="w-28 font-medium">Page count:</span>
                                <span className="flex-1">1</span>
                            </div>
                            <div className="flex mb-3">
                                <span className="w-28 font-medium">Page size:</span>
                                <span className="flex-1">8.26 × 11.69 in (portrait)</span>
                            </div>
                            <div className="h-px bg-gray-700 w-full my-2"></div>

                            <div className="flex mt-2 mb-4">
                                <span className="w-28 font-medium">Fast web view:</span>
                                <span className="flex-1">No</span>
                            </div>

                            <div className="flex justify-end mt-2">
                                <button 
                                    onClick={() => setShowDocProps(false)}
                                    className="px-6 py-1.5 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] rounded-[3px] font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportPrintModal;




