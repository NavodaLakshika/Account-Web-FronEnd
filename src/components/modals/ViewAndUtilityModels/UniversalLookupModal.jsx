import React, { useState, useMemo, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Database, RefreshCw, X } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { documentSearchService } from '../../../services/documentSearch.service';
import { getSessionData } from '../../../utils/session';
import { toast } from 'react-hot-toast';

const UniversalLookupModal = ({ isOpen, onClose, onSelect, type, title, placeholder, initialData }) => {
    const [data, setData] = useState(initialData || []);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Custom Toast Handlers
    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-['Tahoma'] leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-['Tahoma'] leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    useEffect(() => {
        if (isOpen && type && !initialData) {
            loadData();
        }
    }, [isOpen, type, initialData]);

    const loadData = async () => {
        setLoading(true);
        try {
            const session = getSessionData();
            const response = await documentSearchService.getLookups(session?.userName);
            
            let result = [];
            if (type === 'customer') result = response.data.customers;
            else if (type === 'supplier') result = response.data.suppliers;
            else if (type === 'transType') result = response.data.transTypes;
            else if (type === 'costCenter') result = response.data.costCenters;
            else if (type === 'payee') result = response.data.payees.map(p => ({ code: p, name: p }));
            
            setData(result);
        } catch (error) {
            console.error(error);
            showErrorToast(`Failed to sync ${type} archive`);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        const source = initialData || data;
        if (!source) return [];
        return source.filter(item => 
            (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, initialData, searchQuery]);

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={title || "PROFILE LOOKUP"}
            maxWidth="max-w-[700px]"
        >
            <div className="space-y-4 font-['Tahoma']">
                {/* Search Header */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    <div className="relative flex-1">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                         <input 
                            type="text" 
                            placeholder={placeholder || "Filter by code or description..."} 
                            className="w-full h-9 pl-10 pr-10 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
                         {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <RefreshCw size={14} className="animate-spin text-[#0285fd]" />
                            </div>
                         )}
                    </div>
                </div>

                {/* Data Table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-3">Reference ID</th>
                                    <th className="px-5 py-3">Profile Description</th>
                                    <th className="px-5 py-3 text-right">Interaction</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {loading && data.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-[#0285fd] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Syncing Archive...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((item, i) => (
                                        <tr 
                                            key={i} 
                                            className="group hover:bg-blue-50/50 cursor-pointer transition-colors" 
                                            onClick={() => onSelect(item)}
                                        >
                                            <td className="px-5 py-3 font-mono text-[13px] font-mono text-gray-600">
                                                {item.code}
                                            </td>
                                            <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase font-bold">
                                                {item.name}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                 <button 
                                                    className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelect(item);
                                                    }}
                                                 >
                                                    SELECT
                                                 </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-20 text-gray-300 text-[12px] font-bold uppercase tracking-widest">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Database size={40} strokeWidth={1} />
                                                <span>No Records Found</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </SimpleModal>
        </>
    );
};

export default UniversalLookupModal;
