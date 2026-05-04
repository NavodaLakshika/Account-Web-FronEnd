import React, { useState, useEffect } from 'react';
import SimpleModal from './SimpleModal';
import { Search, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { accountService } from '../services/account.service';

const MainAccountTypeModal = ({ isOpen, onClose, onSelect }) => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const companyCode = localStorage.getItem('company') || 'C001';

    useEffect(() => {
        if (isOpen) {
            loadTypes();
        }
    }, [isOpen]);

    const loadTypes = async () => {
        setLoading(true);
        try {
            const data = await accountService.getMainTypes(companyCode);
            setTypes(data);
        } catch (error) {
            console.error('Failed to load account types', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTypes = types.filter(t => 
        t.main_Acc_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.main_Acc_Code.includes(searchTerm)
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="SELECT ACCOUNT CATEGORY"
            maxWidth="max-w-md"
        >
            <div className="p-4 space-y-4 font-['Tahoma']">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search categories.."
                        className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-gray-100 rounded-lg">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 className="animate-spin mb-2" size={24} />
                            <span className="text-xs">Loading categories...</span>
                        </div>
                    ) : filteredTypes.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredTypes.map((type) => (
                                <button
                                    key={type.main_Acc_Code}
                                    onClick={() => {
                                        onSelect(type);
                                        onClose();
                                    }}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 group-hover:text-blue-900 uppercase">{type.main_Acc_Name}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{type.main_Acc_Code}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-400 text-sm italic">
                            No matching categories found
                        </div>
                    )}
                </div>
            </div>
        </SimpleModal>
    );
};

export default MainAccountTypeModal;
