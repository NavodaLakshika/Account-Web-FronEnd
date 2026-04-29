import React, { useState } from 'react';
import SimpleModal from '../SimpleModal';
import { Search, User, Filter, X } from 'lucide-react';

const UserSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data
    const users = [
        { id: '001', name: 'Admin', role: 'Administrators' },
        { id: '002', name: 'Navoda', role: 'Administrators' },
        { id: '003', name: 'Standard User', role: 'Standard Users' },
    ];

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.id.includes(searchTerm)
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="User Search"
            maxWidth="max-w-md"
        >
            <div className="p-1 space-y-4 font-['Tahoma']">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-[13px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* User List */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2 flex items-center gap-4 border-b border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16">ID</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex-1">User Name</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-24">Role</span>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        onSelect(user.name);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 text-left group"
                                >
                                    <span className="text-[13px] font-mono text-gray-500 w-16">{user.id}</span>
                                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600 flex-1">{user.name}</span>
                                    <span className="text-[12px] text-gray-500 w-24">{user.role}</span>
                                </button>
                            ))
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center text-gray-400 italic">
                                <Filter size={24} className="mb-2 opacity-20" />
                                <span className="text-[13px]">No users found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Footer */}
                <div className="flex items-center justify-between px-2 text-[11px] text-gray-400 font-medium italic">
                    <span>Total Users: {users.length}</span>
                    <span>Selected: 0</span>
                </div>
            </div>
        </SimpleModal>
    );
};

export default UserSearchModal;
