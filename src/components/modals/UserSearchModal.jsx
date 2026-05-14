import React, { useState, useEffect } from 'react';
import SimpleModal from '../SimpleModal';
import { Search, User, Filter, X, Loader2 } from 'lucide-react';
import { userProfileService } from '../../services/userProfile.service';

const UserSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = '';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) {
                    companyCode = companyData;
                }
            }
            
            console.log('Fetching users with:', { companyCode, searchTerm });
            const data = await userProfileService.searchUsers(companyCode, searchTerm);
            console.log('Users received:', data);
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

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
                    {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />}
                </div>

                {/* User List */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-[#f8fafd] px-4 py-2 flex items-center gap-4 border-b border-gray-100">
                        <span className="text-[11px] font-[900] text-gray-400 uppercase tracking-widest w-16">ID</span>
                        <span className="text-[11px] font-[900] text-gray-400 uppercase tracking-widest flex-1">User Name</span>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <button
                                    key={user.emp_Code}
                                    onClick={() => {
                                        onSelect(user);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 text-left group"
                                >
                                    <span className="text-[12px] font-bold text-[#0078d4] w-16">{user.emp_Code}</span>
                                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600 flex-1 uppercase">{user.emp_Name}</span>
                                    <div className="bg-[#e49e1b] text-white text-[10px] px-4 py-1 rounded-md font-bold uppercase">Select</div>
                                </button>
                            ))
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center text-gray-400 italic">
                                <span className="text-[13px] font-bold uppercase tracking-widest">{loading ? 'Searching...' : 'No users found'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Footer */}
                <div className="flex items-center justify-between px-2 text-[11px] text-gray-400 font-medium italic">
                    <span>Total Records: {users.length}</span>
                </div>
            </div>
        </SimpleModal>
    );
};

export default UserSearchModal;
