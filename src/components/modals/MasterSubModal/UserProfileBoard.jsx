import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Plus, ShieldCheck, UserPlus, UserMinus, Calendar , X} from 'lucide-react';

const UserProfileBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="User Profile"
            maxWidth="max-w-xl"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                    <button className="px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center gap-2">
                         <UserPlus size={16} /> Add User
                    </button>
                    <button className="px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center gap-2">
                         <UserMinus size={16} /> Delete User
                    </button>
                    <button 
                        onClick={onClose} 
                        className="px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <X size={16} /> Exit
                    </button>
                </div>
            }
        >
            <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-4 min-h-[400px]">
                <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-center">
                    <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Enter Users & Give Function to Them</h2>
                </div>

                <div className="space-y-4">
                    {/* User Name */}
                    <div className="flex items-center gap-6">
                        <label className="w-32 font-bold text-gray-700">User Name</label>
                        <div className="flex-1 flex gap-3">
                            <input 
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md"
                            />
                            <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                <Search size={18} />
                            </button>
                            <button className="px-6 h-8 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95">
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-6">
                        <label className="w-32 font-bold text-gray-700">Password</label>
                        <input 
                            type="password" 
                            className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md max-w-[280px]"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="flex items-center gap-6">
                        <label className="w-32 font-bold text-gray-700">Confirm Password</label>
                        <input 
                            type="password" 
                            className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md max-w-[280px]"
                        />
                    </div>

                    {/* Checkboxes Area */}
                    <div className="bg-slate-50/50 p-4 border border-gray-100 rounded-xl space-y-4">
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <input type="checkbox" className="w-5 h-5 rounded-[5px] border-gray-300 text-[#0078d4] focus:ring-[#0078d4] shadow-sm transition-all" />
                                <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">User must change Password at Next Login</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <input type="checkbox" className="w-5 h-5 rounded-[5px] border-gray-300 text-[#0078d4] focus:ring-[#0078d4] shadow-sm transition-all" />
                                <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">User can't change Password</span>
                            </label>
                            <div className="flex items-center gap-10">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded-[5px] border-gray-300 text-[#0078d4] focus:ring-[#0078d4] shadow-sm transition-all" />
                                    <span className="font-bold text-gray-700 group-hover:text-red-500 transition-colors">Account Disable</span>
                                </label>
                                
                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="h-8 border border-gray-300 bg-white flex items-center px-3 rounded-[5px] w-40 shadow-sm">
                                        <span className="flex-1 text-[13px] text-blue-600 font-bold">13/03/2026</span>
                                        <Calendar size={14} className="text-gray-400" />
                                    </div>
                                    <span className="font-bold text-gray-700">Closing Date</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member of & Actions */}
                    <div className="pt-4 flex items-center gap-4">
                        <label className="w-32 font-bold text-gray-700">Member of</label>
                        <select className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm max-w-[200px]">
                            <option value=""></option>
                            <option value="Admin">Administrators</option>
                            <option value="User">Standard Users</option>
                        </select>
                        <button className="px-6 h-8 bg-[#e49e1b] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95">
                            New
                        </button>
                        <button className="flex-1 h-8 bg-[#0078d4] text-white text-[11px] font-bold rounded-[5px] hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 flex items-center justify-center uppercase tracking-tight">
                            <ShieldCheck size={14} className="mr-2" /> Cost Center Authentication
                        </button>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default UserProfileBoard;
