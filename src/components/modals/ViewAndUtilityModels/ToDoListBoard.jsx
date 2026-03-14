import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, Calendar, Clock, ChevronDown } from 'lucide-react';

const ToDoListBoard = ({ isOpen, onClose }) => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="To Do List"
            maxWidth="max-w-xl"
            footer={
                <>
                    <button className="px-10 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                         Save
                    </button>
                    <button onClick={onClose} className="px-10 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e]">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Header with Alarm Icon and Text */}
                <div className="flex items-center justify-between px-2 pt-1 bg-white rounded-t-lg">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
                             {/* Retro Alarm Clock Styled Image/Icon */}
                             <div className="text-4xl">⏰</div>
                        </div>
                        <h1 className="text-[22px] font-extrabold italic text-[#009dff] tracking-tight drop-shadow-sm">
                            Reminder and To - Do - List
                        </h1>
                    </div>
                    <button className="px-6 py-1 bg-white border border-gray-400 text-[#000080] font-bold text-[13px] hover:bg-gray-100 rounded-sm shadow-sm transition-colors active:translate-y-0.5">
                        View All
                    </button>
                </div>

                {/* Form Body */}
                <div className="bg-gray-50/50 p-4 border border-gray-300 rounded-sm shadow-inner space-y-4">
                    <div className="flex items-center gap-12">
                        {/* Date field */}
                        <div className="flex items-center gap-3">
                            <label className="text-[15px] font-bold text-gray-800">Date</label>
                            <div className="relative flex items-center">
                                <div className="flex items-center border border-gray-400 bg-white">
                                    <input 
                                        type="text" 
                                        defaultValue="13/03/2026"
                                        className="w-[160px] h-8 px-2 text-[14px] font-medium text-gray-700 outline-none"
                                    />
                                    <button className="h-8 w-8 border-l border-gray-400 bg-[#f3f4f6] flex items-center justify-center hover:bg-gray-200 text-gray-600">
                                        <Calendar size={16} />
                                        <ChevronDown size={12} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Time field */}
                        <div className="flex items-center gap-3">
                            <label className="text-[15px] font-bold text-gray-800">Time</label>
                            <div className="flex items-center px-2 h-8 border border-[#009dff] bg-white w-[150px] shadow-sm">
                                <span className="text-[14px] text-[#000080] font-mono font-bold flex-1">{currentTime}</span>
                                <div className="border-l border-gray-300 pl-2 h-full flex items-center">
                                     <div className="w-3 h-3 border-r border-b border-gray-600 rotate-45 transform -translate-y-0.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task field */}
                    <div className="space-y-1">
                        <label className="text-[15px] font-bold text-gray-800">Task</label>
                        <div className="w-full bg-white border border-gray-400 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] p-1 min-h-[160px]">
                             <textarea 
                                className="w-full h-[150px] p-3 text-[14px] font-medium text-gray-800 focus:outline-none resize-none overflow-y-auto bg-transparent leading-relaxed"
                                spellCheck="false"
                                placeholder="Enter your task details here..."
                             />
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default ToDoListBoard;
