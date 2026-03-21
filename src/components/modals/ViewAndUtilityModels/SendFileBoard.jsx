import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Send, Monitor, MoreHorizontal , X} from 'lucide-react';

const SendFileBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Send File To Other..."
            maxWidth="max-w-2xl"
            footer={
                <>
                    <button className="px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 border-none flex items-center gap-2">
                        <Send size={14} /> Send
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center gap-2">
                        <X size={14} /> Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6 py-2">
                <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm space-y-4">
                    {/* File Name Field */}
                    <div className="flex items-center gap-4">
                        <label className="text-[14px] font-bold text-gray-800 w-[120px] shrink-0">File Name</label>
                        <div className="flex-1 flex gap-1">
                            <input 
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <button className="w-10 h-8 bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 rounded-sm transition-colors text-gray-600 font-bold">
                                ..
                            </button>
                        </div>
                    </div>

                    {/* Send File To Field */}
                    <div className="flex items-center gap-4">
                        <label className="text-[14px] font-bold text-gray-800 w-[120px] shrink-0">Send File To</label>
                        <div className="flex-1 flex gap-1">
                            <input 
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <button className="w-10 h-8 bg-[#f3f4f6] border border-gray-300 flex items-center justify-center hover:bg-gray-200 rounded-sm transition-colors">
                                {/* Placeholder for empty square button in image */}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Network Computer Button */}
                <div className="flex justify-end pr-1">
                    <button className="flex items-center gap-3 px-4 py-1.5 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-all shadow-sm group">
                        <div className="p-1 bg-blue-50 rounded-sm">
                            <Monitor size={18} className="text-[#0078d4]" />
                        </div>
                        <span className="text-[14px] font-bold text-gray-800 tracking-tight">
                            View All Network Computer
                        </span>
                    </button>
                </div>
            </div>
        </SimpleModal>
    );
};

export default SendFileBoard;
