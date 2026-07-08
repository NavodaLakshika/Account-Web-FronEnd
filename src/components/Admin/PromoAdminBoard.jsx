import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, Edit, Plus, CheckCircle, XCircle, Loader2, X, Database, Layout, Cpu, Globe, Save } from 'lucide-react';
import { adService } from '../../services/ad.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const AVAILABLE_ICONS = [
    { name: 'Database', component: Database },
    { name: 'Layout', component: Layout },
    { name: 'Cpu', component: Cpu },
    { name: 'Globe', component: Globe },
];

const AVAILABLE_COLORS = [
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-500' },
    { name: 'Emerald', value: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-500' },
    { name: 'Purple', value: '#7c3aed', bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-500' },
    { name: 'Stone', value: '#78716c', bg: 'bg-stone-50', border: 'border-stone-200', iconBg: 'bg-stone-500' },
    { name: 'Red', value: '#ef4444', bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-500' },
    { name: 'Orange', value: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-500' },
];

const PromoAdminBoard = ({ isOpen, onClose, inlineView }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAd, setCurrentAd] = useState(null);

    // Form states
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [iconName, setIconName] = useState('Globe');
    const [colorObj, setColorObj] = useState(AVAILABLE_COLORS[0]);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen || inlineView) {
            fetchAds();
        }
    }, [isOpen, inlineView]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const data = await adService.getAllAds();
            setAds(data || []);
        } catch (error) {
            // Error handling is quiet here because endpoint might not exist yet
            console.error('Failed to fetch ads', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (ad = null) => {
        if (ad) {
            setTitle(ad.title || '');
            setDesc(ad.desc || '');
            setIconName(ad.iconName || 'Globe');
            const foundColor = AVAILABLE_COLORS.find(c => c.value === ad.accent) || AVAILABLE_COLORS[0];
            setColorObj(foundColor);
            setIsActive(ad.isActive !== undefined ? ad.isActive : true);
            setCurrentAd(ad);
        } else {
            setTitle('');
            setDesc('');
            setIconName('Globe');
            setColorObj(AVAILABLE_COLORS[0]);
            setIsActive(true);
            setCurrentAd(null);
        }
        setIsEditing(true);
    };

    const handleCloseForm = () => {
        setIsEditing(false);
        setCurrentAd(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !desc.trim()) {
            showErrorToast("Title and description are required.");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            title,
            desc,
            iconName,
            accent: colorObj.value,
            bg: colorObj.bg,
            border: colorObj.border,
            iconBg: colorObj.iconBg,
            isActive
        };

        try {
            if (currentAd && currentAd.id) {
                await adService.updateAd(currentAd.id, payload);
                showSuccessToast("Ad updated successfully!");
            } else {
                await adService.createAd(payload);
                showSuccessToast("Ad created successfully!");
            }
            fetchAds();
            handleCloseForm();
        } catch (error) {
            showErrorToast("Failed to save ad. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await adService.updateAdStatus(id, status);
            showSuccessToast(`Ad ${status ? 'activated' : 'deactivated'}`);
            fetchAds();
        } catch (error) {
            showErrorToast("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ad?")) return;
        
        try {
            await adService.deleteAd(id);
            showSuccessToast("Ad deleted successfully");
            fetchAds();
        } catch (error) {
            showErrorToast("Failed to delete ad");
        }
    };

    if (!isOpen && !inlineView) return null;

    const Content = (
        <div className={inlineView ? "flex flex-col h-full animate-in fade-in duration-300" : "bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"}>
            {/* Header */}
                <div className={inlineView ? "flex items-center justify-between mb-6" : "flex items-center justify-between p-6 border-b border-slate-200 bg-white"}>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-800 dark:text-white flex items-center gap-2">
                            <Megaphone className="text-orange-500" size={20} />
                            System Advertisements
                        </h2>
                        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mt-1">Manage promotional banners displayed to users.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isEditing && (
                            <button 
                                onClick={() => handleOpenForm()}
                                className="flex items-center gap-2 px-4 py-2 bg-[#00acee] hover:bg-[#009adb] text-slate-800 dark:text-white text-xs font-bold rounded-[3px] shadow-md transition-all active:scale-[0.98]"
                            >
                                <Plus size={16} /> Create New Ad
                            </button>
                        )}
                        {!inlineView && (
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                            >
                                <X size={28} strokeWidth={1.5} className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                <div className={inlineView ? "flex-1 overflow-y-auto" : "p-6 overflow-y-auto flex-1"}>
                    {isEditing ? (
                        /* Edit/Create Form */
 <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm dark:border-slate-700 overflow-hidden p-6 max-w-2xl mx-auto">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-800 dark:text-white mb-6">{currentAd ? 'Edit Advertisement' : 'Create New Advertisement'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400 mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)} 
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-[3px] focus:outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee]/50 text-slate-900 dark:text-slate-800 dark:text-white"
                                        placeholder="e.g. Merit Plus Finance"
                                        maxLength={40}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400 mb-2">Description</label>
                                    <textarea 
                                        value={desc} 
                                        onChange={e => setDesc(e.target.value)} 
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-[3px] focus:outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee]/50 resize-none h-24 text-slate-900 dark:text-slate-800 dark:text-white"
                                        placeholder="Brief description of the promotion..."
                                        maxLength={100}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400 mb-2">Icon</label>
                                        <div className="flex gap-2">
                                            {AVAILABLE_ICONS.map(iconOpt => {
                                                const IconCmp = iconOpt.component;
                                                return (
                                                    <button 
                                                        key={iconOpt.name}
                                                        type="button"
                                                        onClick={() => setIconName(iconOpt.name)}
                                                        className={`p-2 rounded-[3px] border transition-all ${iconName === iconOpt.name ? 'border-[#00acee] bg-[#00acee]/10 text-[#00acee] shadow-sm' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                                                        title={iconOpt.name}
                                                    >
                                                        <IconCmp size={20} />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400 mb-2">Accent Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_COLORS.map(c => (
                                                <button 
                                                    key={c.name}
                                                    type="button"
                                                    onClick={() => setColorObj(c)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${colorObj.name === c.name ? 'border-slate-800 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-110'}`}
                                                    style={{ backgroundColor: c.value }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input 
                                        type="checkbox" 
                                        id="isActiveAd" 
                                        checked={isActive} 
                                        onChange={e => setIsActive(e.target.checked)} 
                                        className="w-4 h-4 text-[#00acee] rounded border-slate-300 dark:border-slate-600 focus:ring-[#00acee]"
                                    />
                                    <label htmlFor="isActiveAd" className="text-sm font-semibold text-slate-700 dark:text-slate-600 dark:text-slate-300 cursor-pointer">
                                        Ad is Active (Visible to users)
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-slate-800 dark:text-white font-bold rounded-[3px] shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Save Advertisement
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCloseForm}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-600 dark:text-slate-300 font-bold rounded-[3px] hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* List View */
 <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700">
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-500 dark:text-slate-400 whitespace-nowrap">Advertisement</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-500 dark:text-slate-400 whitespace-nowrap">Accent</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-500 dark:text-slate-400 whitespace-nowrap">Status</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="py-12 px-6 text-center text-slate-500 dark:text-slate-400">
                                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                                                    Loading ads...
                                                </td>
                                            <th className="text-right px-5 py-3">Action</th></tr>
                                        ) : ads.map(ad => {
                                            const iconOpt = AVAILABLE_ICONS.find(i => i.name === ad.iconName) || AVAILABLE_ICONS[3];
                                            const IconCmp = iconOpt.component;
                                            return (
                                            <tr key={ad.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-[3px] flex items-center justify-center shrink-0 shadow-sm ${ad.iconBg || 'bg-slate-500'}`}>
                                                            <IconCmp size={18} className="text-slate-800 dark:text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-slate-800 dark:text-white">{ad.title}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">{ad.desc}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-600" style={{ backgroundColor: ad.accent || '#78716c' }} />
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-500 dark:text-slate-400">{ad.accent || '#78716c'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                                                        ad.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                        {ad.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {ad.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleUpdateStatus(ad.id, !ad.isActive)}
                                                            className={`p-2 rounded-[3px] transition-colors ${ad.isActive ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                            title={ad.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {ad.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenForm(ad)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-[3px] transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(ad.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[3px] transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )})}
                                        {!loading && ads.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="py-12 px-6 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">
                                                    No advertisements found. Create one to get started.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );

    if (inlineView) return Content;

    return (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/30 backdrop-blur-sm overflow-y-auto">
            {Content}
        </div>
    );
};

export default PromoAdminBoard;




