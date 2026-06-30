import React, { useState, useMemo, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Database, RefreshCw, X } from 'lucide-react';

import { documentSearchService } from '../../../services/documentSearch.service';
import { getSessionData } from '../../../utils/session';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';


const UniversalLookupModal = ({ isOpen, onClose, onSelect, type, title, placeholder, initialData }) => {
    const [data, setData] = useState(initialData || []);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Custom Toast Handlers
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
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    <div className="relative flex-1">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                         <input 
                            type="text" 
                            placeholder={placeholder || "Filter by code or description..."} 
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" 
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
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm bg-white">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className=" px-5 py-3">Reference ID</th>
                                    <th className=" px-5 py-3">Profile Description</th>
                                    <th className="text-right px-5 py-3">Interaction</th>
                                <th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {loading && data.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
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
                                            className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" 
                                            onClick={() => onSelect(item)}
                                        >
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                {item.code}
                                            </td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                {item.name}
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                 <button 
                                                    className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelect(item);
                                                    }}
                                                 >
                                                    SELECT
                                                 </button>
                                            </td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
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
