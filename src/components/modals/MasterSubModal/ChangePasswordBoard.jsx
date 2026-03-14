import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, KeyRound, LogOut } from 'lucide-react';

const ChangePasswordBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Password"
            maxWidth="max-w-md"
            footer={
                <>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                         Change
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-4 py-2">
                <div className="bg-gray-50/50 p-6 border border-gray-200 rounded-sm space-y-4">
                    {/* User Name */}
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">User Name</label>
                        <div className="flex-1 flex gap-1">
                            <input 
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                            />
                            <button className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                <Search size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Current Password */}
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">Current Password</label>
                        <input 
                            type="password" 
                            className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                        />
                    </div>

                    {/* New Password */}
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">New Password</label>
                        <input 
                            type="password" 
                            className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">Confirm Password</label>
                        <input 
                            type="password" 
                            className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                        />
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default ChangePasswordBoard;
