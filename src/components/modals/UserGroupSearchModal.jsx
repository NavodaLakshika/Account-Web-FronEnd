import React, { useState } from 'react';
import SimpleModal from '../SimpleModal';
import { Search, Users, Shield, Plus, X } from 'lucide-react';

const UserGroupSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for user groups
    const groups = [
        { id: 'GRP01', name: 'Administrators', description: 'Full system access', count: 2 },
        { id: 'GRP02', name: 'Standard Users', description: 'General operations', count: 15 },
        { id: 'GRP03', name: 'Finance Team', description: 'Accounting and reporting', count: 5 },
        { id: 'GRP04', name: 'Inventory Managers', description: 'Stock and GRN management', count: 3 },
    ];

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        group.id.includes(searchTerm)
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="User Group Search"
            maxWidth="max-w-md"
        >
            <div className="p-1 space-y-4 font-['Tahoma']">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by group name..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-[13px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Group List */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2 flex items-center gap-4 border-b border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex-1">Group Name</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16 text-center">Users</span>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => {
                                        onSelect(group.name);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 text-left group"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-blue-500" />
                                            <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">{group.name}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{group.description}</p>
                                    </div>
                                    <div className="w-16 flex justify-center">
                                        <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full">{group.count}</span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center text-gray-400 italic">
                                <Users size={24} className="mb-2 opacity-20" />
                                <span className="text-[13px]">No groups found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                    <button className="w-full h-10 border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold">
                        <Plus size={16} /> Create New Group
                    </button>
                </div>
            </div>
        </SimpleModal>
    );
};

export default UserGroupSearchModal;
