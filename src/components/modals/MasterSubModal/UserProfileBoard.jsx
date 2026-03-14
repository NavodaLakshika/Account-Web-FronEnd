import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Plus, ShieldCheck, UserPlus, UserMinus, Calendar } from 'lucide-react';

const UserProfileBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="User Profile"
            maxWidth="max-w-xl"
            footer={
                <>
                    <button className="px-6 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                         Add User
                    </button>
                    <button className="px-6 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                         Delete User
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e]">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2 mb-4">
                    <h2 className="text-[15px] font-bold text-gray-800">Enter Users & Give Function to Them</h2>
                </div>

                <div className="bg-gray-50/50 p-4 border border-gray-200 rounded-sm space-y-3">
                    {/* User Name */}
                    <div className="flex items-center gap-2">
                        <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">User Name</label>
                        <div className="flex-1 flex gap-1">
                            <input 
                                type="text" 
                                className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                <Search size={14} />
                            </button>
                            <button className="px-4 h-7 bg-white text-gray-700 text-[12px] font-bold border border-gray-400 hover:bg-gray-50 rounded-sm ml-1">
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-2">
                        <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">Password</label>
                        <input 
                            type="password" 
                            className="w-[280px] h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="flex items-center gap-2">
                        <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">Confirm Password</label>
                        <input 
                            type="password" 
                            className="w-[280px] h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="pt-2 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer group w-fit">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" />
                            <span className="text-[12px] font-semibold text-gray-700 group-hover:text-blue-600">User must change Password at Next Login</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group w-fit">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" />
                            <span className="text-[12px] font-semibold text-gray-700 group-hover:text-blue-600">User can't change Password</span>
                        </label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" />
                                <span className="text-[12px] font-semibold text-gray-700 group-hover:text-blue-600">Account Disable</span>
                            </label>
                            
                            <div className="flex items-center gap-2 ml-auto lg:ml-20">
                                <div className="h-7 border border-gray-300 bg-white flex items-center px-2 rounded-sm w-[150px]">
                                    <span className="flex-1 text-sm text-gray-700">13/03/2026</span>
                                    <Calendar size={14} className="text-gray-400" />
                                </div>
                                <span className="text-[12px] font-semibold text-gray-700">Closing Date</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="pt-4 flex items-center gap-2">
                        <label className="text-[12px] font-semibold text-gray-600 w-[110px] shrink-0">Member of</label>
                        <select className="w-[200px] h-7 border border-gray-300 px-2 text-sm bg-white focus:border-blue-500 outline-none rounded-sm">
                            <option value=""></option>
                        </select>
                        <button className="px-6 h-7 bg-white text-gray-800 text-[13px] font-bold border border-gray-400 hover:bg-gray-50 rounded-sm ml-2">
                            New
                        </button>
                        <button className="flex-1 h-7 bg-white text-gray-800 text-[12px] font-bold border border-gray-400 hover:bg-gray-50 rounded-sm flex items-center justify-center">
                            Cost Center Authentication
                        </button>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default UserProfileBoard;
