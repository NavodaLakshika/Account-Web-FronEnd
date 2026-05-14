import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { Users, FileText, Save, RotateCcw, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const UserGroupBoard = ({ isOpen, onClose, onGroupCreated }) => {
    const [group_Name, setGroup_Name] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const handleClear = () => {
        setGroup_Name('');
        setDescription('');
    };

    const handleSave = async () => {
        if (!group_Name.trim()) return showErrorToast('Group Name is required');

        setSaving(true);
        try {
            await api.post('/UserGroup/create', {
                group_Name,
                description
            });
            showSuccessToast('User group created successfully');
            if (onGroupCreated) onGroupCreated();
            onClose();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Failed to create user group');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create User Group"
            maxWidth="max-w-xl"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                    <button 
                        onClick={handleSave} 
                        disabled={saving} 
                        className="px-8 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Group
                    </button>
                    <button 
                        onClick={handleClear} 
                        className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={16} /> Clear
                    </button>
                </div>
            }
        >
            <div className="py-6 select-none font-['Tahoma'] space-y-6 text-[12.5px]">
                
                {/* Group Name Row */}
                <div className="flex items-center gap-3 px-2">
                    <label className="w-32 font-bold text-gray-700 uppercase">Group Name</label>
                    <div className="flex-1 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                value={group_Name} 
                                onChange={(e) => setGroup_Name(e.target.value)} 
                                className="w-full h-8 border border-gray-300 pl-10 pr-3 bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold uppercase shadow-sm"
                                placeholder="E.G. FINANCE TEAM"
                            />
                        </div>
                        <div className="w-10 flex-shrink-0" /> {/* Alignment spacer */}
                    </div>
                </div>

                {/* Description Row */}
                <div className="flex items-start gap-3 px-2">
                    <label className="w-32 font-bold text-gray-700 uppercase mt-2">Description</label>
                    <div className="flex-1 flex items-center gap-2">
                        <div className="relative flex-1">
                            <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                className="w-full h-24 border border-gray-300 pl-10 pr-3 py-2 bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold uppercase shadow-sm resize-none"
                                placeholder="ENTER GROUP DESCRIPTION..."
                            />
                        </div>
                        <div className="w-10 flex-shrink-0" />
                    </div>
                </div>

            </div>
        </SimpleModal>
    );
};

export default UserGroupBoard;
