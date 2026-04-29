import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Plus, ShieldCheck, UserPlus, UserMinus, Calendar, X } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import UserSearchModal from '../UserSearchModal';
import UserGroupSearchModal from '../UserGroupSearchModal';

const UserProfileBoard = ({ isOpen, onClose }) => {
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showGroupSearch, setShowGroupSearch] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [userName, setUserName] = useState('');
    const [userGroup, setUserGroup] = useState('Administrators');
    const [closingDate, setClosingDate] = useState('13/03/2026');

    return (
        <>
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="User Profile"
            maxWidth="max-w-xl"
            footer={
                <div className="bg-slate-50 px-6 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                    <button className="px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center gap-2">
                         <UserPlus size={16} /> Add User
                    </button>
                    <button className="px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center gap-2">
                         <UserMinus size={16} /> Delete User
                    </button>
                </div>
            }
        >
            <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-1 ">
                <div className="space-y-4">
                    {/* User Name */}
                    <div className="flex items-center gap-6">
                        <label className="w-32 font-bold text-gray-700">User Name</label>
                        <div className="flex-1 flex gap-3">
                            <input 
                                type="text" 
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md"
                            />
                            <button 
                                onClick={() => setShowUserSearch(true)}
                                className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-6">
                        <label className="w-32 font-bold text-gray-700">Password</label>
                        <div className="flex-1 flex gap-3">
                            <input 
                                type="password" 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md"
                            />
                            <div className="w-10" /> {/* Spacer to align with username search button */}
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex items-center gap-6">
                        <label className="w-32 font-bold text-gray-700">Confirm Password</label>
                        <div className="flex-1 flex gap-3">
                            <input 
                                type="password" 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md"
                            />
                            <div className="w-10" /> {/* Spacer to align with username search button */}
                        </div>
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
                                    <span className="font-bold text-red-500 group-hover:text-red-500 transition-colors">Account Disable</span>
                                </label>
                                
                                <div className="flex items-center gap-4 ml-auto">
                                    <span className="font-bold text-gray-700">Closing Date</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 border border-gray-300 bg-white flex items-center px-3 rounded-[5px] w-32 shadow-sm">
                                            <span className="text-[13px]  font-bold">{closingDate}</span>
                                        </div>
                                        <button 
                                            onClick={() => setShowCalendar(true)}
                                            className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member of & Actions */}
                    <div className="pt-4 flex items-center gap-4">
                        <label className="w-32 font-bold text-gray-700">Member of</label>
                        <div className="flex-1 flex gap-2 max-w-[280px]">
                            <div className="flex-1 h-8 border border-gray-300 px-3 bg-slate-50 rounded-[5px] flex items-center overflow-hidden">
                                <span className="text-[12px] font-bold text-gray-600 whitespace-nowrap truncate">{userGroup}</span>
                            </div>
                            <button 
                                onClick={() => setShowGroupSearch(true)}
                                className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                            >
                                <Search size={16} />
                            </button>
                        </div>
                        <button className="px-8 w-64 h-8 mr-1 bg-[#0078d4] text-white text-[8px] font-bold rounded-[5px] hover:bg-[#005a9e] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center uppercase tracking-tight">
                         Cost Center Authentication
                        </button>
                    </div>
                </div>
            </div>
        </SimpleModal>

        {showUserSearch && (
            <UserSearchModal 
                isOpen={showUserSearch} 
                onClose={() => setShowUserSearch(false)}
                onSelect={(name) => setUserName(name)}
            />
        )}

        {showGroupSearch && (
            <UserGroupSearchModal 
                isOpen={showGroupSearch} 
                onClose={() => setShowGroupSearch(false)}
                onSelect={(group) => setUserGroup(group)}
            />
        )}

        {showCalendar && (
            <CalendarModal 
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={(date) => {
                    const d = new Date(date);
                    const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                    setClosingDate(formatted);
                    setShowCalendar(false);
                }}
            />
        )}
        </>
    );
};

export default UserProfileBoard;
