import React, { useState } from 'react';
import { X, ChevronDown, Menu, Minus, Plus, Maximize, RotateCw, Hand, Undo, Redo, Download, Printer, MoreVertical } from 'lucide-react';

const ReportPrintModal = ({ isOpen, onClose, companyName, title, subtitle, data = [], columns = [] }) => {
    const [orientation, setOrientation] = useState('Portrait');
    const [scaling, setScaling] = useState('Smart page break');
    const [showHeaders, setShowHeaders] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-[1320px] h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Print or save as PDF</h2>
                        <p className="text-[13px] text-gray-500 mt-1">To print, right-click the preview and select Print. Or, click the Print icon if you see one below.</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Settings */}
                    <div className="w-[320px] bg-[#f4f5f8] p-6 border-r border-gray-200 shrink-0 overflow-y-auto">
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
                                    <div className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100">
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-[13px] text-gray-700">Show report headers on all pages</span>
                            </label>
                        </div>
                    </div>

                    {/* Right Area - PDF Viewer Mockup */}
                    <div className="flex-1 bg-[#323639] flex flex-col relative overflow-hidden">
                        {/* PDF Viewer Toolbar */}
                        <div className="h-12 bg-[#323639] border-b border-gray-700 flex items-center justify-between px-4 shrink-0 text-gray-300 shadow-md z-10">
                            <div className="flex items-center gap-4">
                                <button className="hover:bg-white/10 p-1.5 rounded"><Menu size={16} /></button>
                                <span className="text-[13px] font-medium truncate w-[200px]">625cc2d6-33a7-455b-99d3...</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/10 rounded px-2 h-7 text-[12px]">
                                    <span className="font-bold text-white">1</span>
                                    <span className="mx-1">/</span>
                                    <span>1</span>
                                </div>
                                <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                <button className="hover:bg-white/10 p-1.5 rounded"><Minus size={16} /></button>
                                <span className="text-[12px] font-bold w-10 text-center">78%</span>
                                <button className="hover:bg-white/10 p-1.5 rounded"><Plus size={16} /></button>
                                <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                <button className="hover:bg-white/10 p-1.5 rounded"><Maximize size={16} /></button>
                                <button className="hover:bg-white/10 p-1.5 rounded"><RotateCw size={16} /></button>
                                <div className="w-px h-5 bg-gray-600 mx-1"></div>
                                <button className="hover:bg-white/10 p-1.5 rounded"><Hand size={16} /></button>
                                <button className="hover:bg-white/10 p-1.5 rounded opacity-50"><Undo size={16} /></button>
                                <button className="hover:bg-white/10 p-1.5 rounded opacity-50"><Redo size={16} /></button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="hover:bg-white/10 p-1.5 rounded"><Download size={16} /></button>
                                <button className="hover:bg-white/10 p-1.5 rounded" onClick={() => window.print()}><Printer size={16} /></button>
                                <button className="hover:bg-white/10 p-1.5 rounded"><MoreVertical size={16} /></button>
                            </div>
                        </div>

                        {/* PDF Viewer Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Thumbnails Sidebar */}
                            <div className="w-[180px] bg-[#242424] border-r border-gray-800 p-4 shrink-0 overflow-y-auto flex flex-col items-center gap-4 hidden lg:flex">
                                <div className="w-full flex flex-col items-center gap-2">
                                    <div className="w-[120px] aspect-[1/1.4] bg-white border-[3px] border-[#8ab4f8] shadow-sm relative overflow-hidden">
                                        <div className="absolute inset-x-0 top-6 flex flex-col items-center text-[3px] scale-50 opacity-40">
                                            <b className="text-[4px]">{companyName}</b>
                                            <span>{title}</span>
                                            <span>{subtitle}</span>
                                        </div>
                                    </div>
                                    <span className="text-[12px] text-white font-bold">1</span>
                                </div>
                            </div>
                            
                            {/* Main Document View */}
                            <div className="flex-1 overflow-auto bg-[#525659] p-8 flex justify-center custom-scrollbar">
                                <div 
                                    className={`bg-white shadow-2xl shrink-0 flex flex-col p-12 transition-all duration-300 ${orientation === 'Portrait' ? 'w-[794px] min-h-[1123px]' : 'w-[1123px] min-h-[794px]'}`}
                                >
                                    {showHeaders && (
                                        <div className="w-full text-center flex flex-col gap-1 mb-8 font-sans">
                                            <h1 className="text-[18px] font-bold text-gray-900 uppercase tracking-wide">{companyName}</h1>
                                            <h2 className="text-[14px] text-gray-700 font-medium">{title}</h2>
                                            <h3 className="text-[12px] text-gray-500">{subtitle}</h3>
                                        </div>
                                    )}
                                    <div className="flex-1 mt-4 pt-4">
                                        {(!data || data.length === 0) ? (
                                            <div className="text-center text-gray-400 text-sm mt-8 pt-8 border-t border-gray-200">[No Data to Print]</div>
                                        ) : (
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-900">
                                                        {columns?.map((col, i) => (
                                                            <th key={i} className="p-2 text-[12px] font-bold text-gray-900" style={{ textAlign: col.align || 'left' }}>
                                                                {col.header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data?.map((row, i) => (
                                                        <tr key={i} className="border-b border-gray-200">
                                                            {columns?.map((col, j) => (
                                                                <td key={j} className="p-2 text-[12px] text-gray-800" style={{ textAlign: col.align || 'left' }}>
                                                                    {col.format ? col.format(row[col.accessor || col.key]) : row[col.accessor || col.key]}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>

                                    {/* Footer & Signatures */}
                                    <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between items-end">
                                        <div className="text-[11px] text-gray-400">
                                            Page 1 of 1
                                        </div>
                                        <div className="flex gap-16 mr-8">
                                            <div className="flex flex-col items-center">
                                                <div className="w-36 border-b border-gray-400 mb-2"></div>
                                                <span className="text-[12px] text-gray-600 font-medium">Prepared By</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="w-36 border-b border-gray-400 mb-2"></div>
                                                <span className="text-[12px] text-gray-600 font-medium">Approved By</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0">
                    <button className="h-9 px-5 border-2 border-[#0077c5] text-[#0077c5] text-[13px] font-bold rounded-[3px] hover:bg-blue-50 transition-colors">
                        Save as PDF
                    </button>
                    <button onClick={() => window.print()} className="h-9 px-5 bg-[#0077c5] hover:bg-[#005ca6] text-white text-[13px] font-bold rounded-[3px] transition-colors shadow-sm">
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportPrintModal;

