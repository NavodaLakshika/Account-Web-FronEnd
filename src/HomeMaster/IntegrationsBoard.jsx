import React, { useState } from 'react';
import { Terminal, Maximize2, ExternalLink, RefreshCw } from 'lucide-react';

const IntegrationsBoard = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const openInNewTab = () => {
        window.open('/swagger/index.html', '_blank');
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh] pb-10">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Terminal className="text-purple-500" size={20} />
                        API Testing & Swagger UI
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Live testing environment for your backend REST APIs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button 
                        onClick={openInNewTab}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <ExternalLink size={14} /> Open Fullscreen
                    </button>
                </div>
            </div>

            {/* SWAGGER IFRAME CONTAINER */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden relative">
                {/* Apply scaling to zoom out the iframe, expanding width/height to compensate */}
                <div className="absolute inset-0 overflow-hidden">
                    <iframe 
                        key={refreshKey}
                        src="/swagger/index.html" 
                        title="Swagger UI API Tester"
                        style={{
                            width: '125%',
                            height: '125%',
                            transform: 'scale(0.8)',
                            transformOrigin: 'top left',
                            border: 'none'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default IntegrationsBoard;
