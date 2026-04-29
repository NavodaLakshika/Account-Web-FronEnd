import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2, X } from 'lucide-react';
import { costCenterService } from '../../../services/costcenter.service';
import { toast } from 'react-hot-toast';

const CostCenterBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '',
        Name: '',
        Inactive: false,
        CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [costCentersList, setCostCentersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                setFormData(prev => ({ 
                    ...prev, 
                    CurrentUser: user.emp_Name || 'SYSTEM' 
                }));
            }
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleClear = () => {
        setFormData({
            ...initialState,
            CurrentUser: formData.CurrentUser
        });
        setIsEditMode(false);
        toast.success('Form cleared');
    };

    const handleSave = async () => {
        if (!formData.Name) {
            toast.error('Cost Center Name is required');
            return;
        }

        setLoading(true);
        try {
            const data = await costCenterService.save({
                Code: formData.Code,
                Name: formData.Name,
                Inactive: formData.Inactive,
                CurrentUser: formData.CurrentUser
            });

            if (data.message === 'inserted') {
                toast.success('Cost Center added successfully');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            } else if (data.message === 'updated') {
                toast.success('Cost Center updated successfully');
            }
        } catch (error) {
            const errorMsg = error.error || error.message || (typeof error === 'string' ? error : 'Failed to save');
            toast.error(errorMsg, { duration: 5000 });
            console.error('Save Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode || !formData.Code) return;
        if (!window.confirm('Are you sure you want to delete this cost center?')) return;

        setLoading(true);
        try {
            await costCenterService.delete(formData.Code);
            toast.success('Cost Center deleted');
            handleClear();
        } catch (error) {
            toast.error(error.error || error.message || 'Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    const openSearch = async () => {
        setLoading(true);
        try {
            const data = await costCenterService.getAll();
            setCostCentersList(data);
            setShowSearchModal(true);
        } catch (error) {
            toast.error('Failed to load cost centers');
        } finally {
            setLoading(false);
        }
    };

    const selectCostCenter = (item) => {
        setFormData({
            Code: item.code || item.Code,
            Name: item.name || item.Name,
            Inactive: item.inactive || item.Inactive,
            CurrentUser: formData.CurrentUser
        });
        setIsEditMode(true);
        setShowSearchModal(false);
        toast.success('Cost Center loaded');
    };

    const footer = (
        <div className="bg-slate-50 px-6 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
            <button 
                onClick={handleSave}
                disabled={loading}
                className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button 
                onClick={handleDelete}
                disabled={!isEditMode || loading}
                className={`px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Trash2 size={14} /> Delete
            </button>
            <button 
                onClick={handleClear}
                className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
            >
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Cost Center Profile"
                maxWidth="max-w-xl"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-1">
                    <div className="space-y-3">
                        {/* Cost Center ID Row */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Cost Center ID</label>
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text" 
                                    name="Code"
                                    value={formData.Code || ''}
                                    readOnly
                                    className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-[5px] outline-none font-bold text-blue-600 shadow-sm text-center"
                                />
                                <button 
                                    onClick={openSearch}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Cost Center Name Row - Single Line */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Cost Center Name</label>
                            <input 
                                type="text" 
                                name="Name"
                                value={formData.Name}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md"
                            />
                        </div>

                        {/* Inactive Row */}
                        <div className="flex items-center gap-6 pt-2">
                            <label className="w-32 font-bold text-gray-700"></label>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    id="cc-inactive"
                                    name="Inactive"
                                    checked={formData.Inactive}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded-[5px] border-gray-300 text-[#0078d4] focus:ring-[#0078d4] shadow-sm transition-all" 
                                />
                                <label htmlFor="cc-inactive" className={`font-bold transition-colors ${formData.Inactive ? 'text-red-500' : 'text-gray-700'} cursor-pointer`}>
                                    Cost Center Inactive
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            {/* System Color Left Accent */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                                style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                            />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Cost Center Search Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowSearchModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                className="h-8 border border-gray-300 px-3 text-xs rounded-md w-60 focus:border-[#0285fd] outline-none shadow-sm transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className=" px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-20 text-center">Code</span>
                                <span className="flex-1 px-3">Cost Center Name</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {costCentersList
                                    .filter(s => (s.name || s.Name)?.toLowerCase().includes(searchQuery.toLowerCase()) || (s.code || s.Code)?.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(s => (
                                    <button 
                                        key={s.code || s.Code} 
                                        onClick={() => selectCostCenter(s)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-20 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {s.code || s.Code}
                                            </span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {s.name || s.Name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                                {costCentersList.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">No cost centers found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CostCenterBoard;
