import React, { useState, useEffect } from 'react';
import SimpleModal from '../SimpleModal';
import { Search, Users, Shield, Plus, X, Loader2 } from 'lucide-react';
import { userProfileService } from '../../services/userProfile.service';
import { showErrorToast } from '../../utils/toastUtils';
import UserGroupBoard from './MasterSubModal/UserGroupBoard';

const UserGroupSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await userProfileService.getUserGroups();
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch user groups:', error);
            showErrorToast('Failed to load user groups');
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = groups.filter(group => 
        group.group_Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
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
                            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />}
                    </div>

                    {/* Group List */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-2.5 flex items-center gap-4 border-b border-gray-100">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex-1">Group Name</span>
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest w-16 text-center">Users</span>
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map((group) => (
                                    <button
                                        key={group.group_Id}
                                        onClick={() => {
                                            onSelect(group.group_Name);
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 text-left group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Shield size={15} className="text-blue-500/70" />
                                                <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{group.group_Name}</span>
                                            </div>
                                            {group.description && (
                                                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{group.description}</p>
                                            )}
                                        </div>
                                        <div className="w-16 flex justify-center">
                                            <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                                {group.user_Count}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center text-gray-400 italic">
                                    <Users size={32} className="mb-3 opacity-10" />
                                    <span className="text-[12px] font-bold uppercase tracking-widest text-slate-300">
                                        {loading ? 'Consulting Registry...' : 'No groups found'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="w-full h-11 border-2 border-dashed border-gray-100 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold group"
                        >
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 
                            Create New Group
                        </button>
                    </div>
                </div>
            </SimpleModal>

            <UserGroupBoard 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onGroupCreated={fetchGroups}
            />
        </>
    );
};

export default UserGroupSearchModal;
