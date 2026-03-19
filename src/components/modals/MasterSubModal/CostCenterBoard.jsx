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
        <div className="flex justify-center gap-3 w-full border-t border-gray-300 pt-3 mt-2 bg-[#f0f0f0]">
            <button 
                onClick={handleSave}
                disabled={loading}
                className={`w-32 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button 
                onClick={handleDelete}
                disabled={!isEditMode || loading}
                className={`w-32 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border border-[#a4262c] hover:bg-[#a4262c] flex items-center justify-center gap-2 ${(!isEditMode || loading) ? 'opacity-50' : ''}`}
            >
                <Trash2 size={14} /> Delete
            </button>
            <button 
                onClick={handleClear}
                className="w-32 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
            <button 
                onClick={onClose} 
                className="w-32 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center justify-center"
            >
                Exit
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
                <div className="space-y-4 py-2 font-['Plus_Jakarta_Sans']">
                    <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Enter New Cost Center Details & Update</h2>
                    
                    <div className="space-y-3">
                        {/* Cost Center ID Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Cost Center ID</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    name="Code"
                                    value={formData.Code}
                                    placeholder="Auto Generated"
                                    readOnly
                                    className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 focus:border-blue-500 outline-none rounded-sm"
                                />
                                <button 
                                    onClick={openSearch}
                                    className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Cost Center Name Row - Single Line */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Cost Center Name</label>
                            <input 
                                type="text" 
                                name="Name"
                                value={formData.Name}
                                onChange={handleInputChange}
                                placeholder="Enter Cost Center Name"
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                        </div>

                        {/* Inactive Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0"></label>
                            <div className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    id="cc-inactive"
                                    name="Inactive"
                                    checked={formData.Inactive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" 
                                />
                                <label htmlFor="cc-inactive" className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors cursor-pointer">
                                    Cost Center Inactive
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[80vh] font-['Plus_Jakarta_Sans']">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-700">Search Cost Centers</h3>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Name or ID..."
                                    className="h-8 border border-gray-300 px-3 text-sm rounded-md w-48 focus:border-blue-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8f9fa] sticky top-0 font-bold text-gray-600">
                                    <tr>
                                        <th className="p-3 border-b text-center w-20">Code</th>
                                        <th className="p-3 border-b">Cost Center Name</th>
                                        <th className="p-3 border-b w-24 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costCentersList
                                        .filter(s => (s.name || s.Name)?.toLowerCase().includes(searchQuery.toLowerCase()) || (s.code || s.Code)?.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(s => (
                                        <tr key={s.code || s.Code} className="hover:bg-blue-50 transition-colors group">
                                            <td className="p-3 border-b text-center font-mono text-xs">{s.code || s.Code}</td>
                                            <td className="p-3 border-b text-gray-700">{s.name || s.Name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button 
                                                    onClick={() => selectCostCenter(s)}
                                                    className="bg-[#0078d4] text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e]"
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {costCentersList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-gray-400 italic">No cost centers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CostCenterBoard;
