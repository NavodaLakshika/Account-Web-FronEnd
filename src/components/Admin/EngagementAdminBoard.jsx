import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, Megaphone, Star, Search, Trash2, EyeOff, CheckCircle, Clock, 
    Loader2, Plus, Edit, XCircle, Save, Database, Layout, Cpu, Globe, 
    Gift, Zap, TrendingUp, Shield, ShoppingCart, Users, Briefcase, Award, Crown, Heart, Smartphone, Monitor,
    Coffee, Music, Video, Camera, Headphones, Map, MapPin, Truck, Box, Calendar, Activity, Anchor,
    AlertCircle, AlertTriangle, Bell, Bookmark, CalendarDays, CameraOff, Cast, Cloud, CloudRain, 
    CloudSnow, CloudLightning, Compass, Crosshair, Download, Upload, Flag, Folder, Image as ImageIcon, Key, Link,
    X
} from 'lucide-react';
import { reviewService } from '../../services/review.service';
import { adService } from '../../services/ad.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import ConfirmModal from '../modals/ConfirmModal';

const AVAILABLE_ICONS = [
    { name: 'Database', component: Database },
    { name: 'Layout', component: Layout },
    { name: 'Cpu', component: Cpu },
    { name: 'Globe', component: Globe },
    { name: 'Gift', component: Gift },
    { name: 'Zap', component: Zap },
    { name: 'TrendingUp', component: TrendingUp },
    { name: 'Shield', component: Shield },
    { name: 'ShoppingCart', component: ShoppingCart },
    { name: 'Users', component: Users },
    { name: 'Briefcase', component: Briefcase },
    { name: 'Award', component: Award },
    { name: 'Crown', component: Crown },
    { name: 'Heart', component: Heart },
    { name: 'Smartphone', component: Smartphone },
    { name: 'Monitor', component: Monitor },
    { name: 'Coffee', component: Coffee },
    { name: 'Music', component: Music },
    { name: 'Video', component: Video },
    { name: 'Camera', component: Camera },
    { name: 'Headphones', component: Headphones },
    { name: 'Map', component: Map },
    { name: 'MapPin', component: MapPin },
    { name: 'Truck', component: Truck },
    { name: 'Box', component: Box },
    { name: 'Calendar', component: Calendar },
    { name: 'Activity', component: Activity },
    { name: 'Anchor', component: Anchor },
    { name: 'AlertCircle', component: AlertCircle },
    { name: 'AlertTriangle', component: AlertTriangle },
    { name: 'Bell', component: Bell },
    { name: 'Bookmark', component: Bookmark },
    { name: 'CalendarDays', component: CalendarDays },
    { name: 'CameraOff', component: CameraOff },
    { name: 'Cast', component: Cast },
    { name: 'Cloud', component: Cloud },
    { name: 'CloudRain', component: CloudRain },
    { name: 'CloudSnow', component: CloudSnow },
    { name: 'CloudLightning', component: CloudLightning },
    { name: 'Compass', component: Compass },
    { name: 'Crosshair', component: Crosshair },
    { name: 'Download', component: Download },
    { name: 'Upload', component: Upload },
    { name: 'Flag', component: Flag },
    { name: 'Folder', component: Folder },
    { name: 'Image', component: ImageIcon },
    { name: 'Key', component: Key },
    { name: 'Link', component: Link },
];

const AVAILABLE_COLORS = [
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500/20', border: 'border-blue-500/50', iconBg: 'bg-blue-500' },
    { name: 'Emerald', value: '#059669', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', iconBg: 'bg-emerald-500' },
    { name: 'Purple', value: '#7c3aed', bg: 'bg-purple-500/20', border: 'border-purple-500/50', iconBg: 'bg-purple-500' },
    { name: 'Stone', value: '#78716c', bg: 'bg-stone-500/20', border: 'border-stone-500/50', iconBg: 'bg-stone-500' },
    { name: 'Red', value: '#ef4444', bg: 'bg-red-500/20', border: 'border-red-500/50', iconBg: 'bg-red-500' },
    { name: 'Orange', value: '#f97316', bg: 'bg-orange-500/20', border: 'border-orange-500/50', iconBg: 'bg-orange-500' },
    { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500/20', border: 'border-pink-500/50', iconBg: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', iconBg: 'bg-indigo-500' },
    { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', iconBg: 'bg-cyan-500' },
    { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500/20', border: 'border-teal-500/50', iconBg: 'bg-teal-500' },
    { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-500/20', border: 'border-rose-500/50', iconBg: 'bg-rose-500' },
    { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500/20', border: 'border-amber-500/50', iconBg: 'bg-amber-500' },
    { name: 'Lime', value: '#84cc16', bg: 'bg-lime-500/20', border: 'border-lime-500/50', iconBg: 'bg-lime-500' },
    { name: 'Fuchsia', value: '#d946ef', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/50', iconBg: 'bg-fuchsia-500' },
    { name: 'Violet', value: '#8b5cf6', bg: 'bg-violet-500/20', border: 'border-violet-500/50', iconBg: 'bg-violet-500' },
    { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', iconBg: 'bg-yellow-500' },
    { name: 'Sky', value: '#0ea5e9', bg: 'bg-sky-500/20', border: 'border-sky-500/50', iconBg: 'bg-sky-500' },
    { name: 'Slate', value: '#64748b', bg: 'bg-slate-500/20', border: 'border-slate-500/50', iconBg: 'bg-slate-500' },
    { name: 'Navy', value: '#1e3a8a', bg: 'bg-blue-900/20', border: 'border-blue-900/50', iconBg: 'bg-blue-900' },
    { name: 'Crimson', value: '#7f1d1d', bg: 'bg-red-900/20', border: 'border-red-900/50', iconBg: 'bg-red-900' },
    { name: 'Forest', value: '#064e3b', bg: 'bg-emerald-900/20', border: 'border-emerald-900/50', iconBg: 'bg-emerald-900' },
    { name: 'Chocolate', value: '#78350f', bg: 'bg-amber-900/20', border: 'border-amber-900/50', iconBg: 'bg-amber-900' },
    { name: 'Grape', value: '#581c87', bg: 'bg-purple-900/20', border: 'border-purple-900/50', iconBg: 'bg-purple-900' },
    { name: 'Charcoal', value: '#0f172a', bg: 'bg-slate-100', border: 'border-slate-900/50', iconBg: 'bg-slate-100' },
];

const AVAILABLE_LOCATIONS = [
    'Dashboard',
    'Login Page',
    'Employee Center',
    'Vendor Center',
    'Customer Center',
    'System Reports'
];

const PLACEMENT_OPTIONS = [
    { id: 'top-left', label: 'Top Left', icon: '↖' },
    { id: 'top-center', label: 'Top Center', icon: '⬆' },
    { id: 'top-right', label: 'Top Right', icon: '↗' },
    { id: 'bottom-left', label: 'Bottom Left', icon: '↙' },
    { id: 'bottom-center', label: 'Bottom Center', icon: '⬇' },
    { id: 'bottom-right', label: 'Bottom Right', icon: '↘' },
];

const EngagementAdminBoard = () => {
    const [activeTab, setActiveTab] = useState('reviews');

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviewSearch, setReviewSearch] = useState('');

    // Ads State
    const [ads, setAds] = useState([]);
    const [loadingAds, setLoadingAds] = useState(false);
    const [adSearch, setAdSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentAd, setCurrentAd] = useState(null);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [iconName, setIconName] = useState('Globe');
    const [colorObj, setColorObj] = useState(AVAILABLE_COLORS[0]);
    const [popupLocations, setPopupLocations] = useState(['Dashboard']);
    const [popupPlacement, setPopupPlacement] = useState('top-right');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, type: null, loading: false });

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchReviews();
        } else {
            fetchAds();
        }
    }, [activeTab]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const data = await reviewService.getAllReviews();
            setReviews(data);
        } catch (error) {
            showErrorToast("Failed to fetch reviews");
            console.error(error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchAds = async () => {
        setLoadingAds(true);
        try {
            const data = await adService.getAllAds();
            setAds(data || []);
        } catch (error) {
            console.error('Failed to fetch ads', error);
            showErrorToast("Failed to load advertisements.");
            setAds([]);
        } finally {
            setLoadingAds(false);
        }
    };

    const handleReviewStatus = async (id, newStatus) => {
        try {
            await reviewService.updateReviewStatus(id, newStatus);
            showSuccessToast(`Review marked as ${newStatus}`);
            fetchReviews();
        } catch (error) {
            showErrorToast("Failed to update status");
        }
    };

    const handleDeleteReview = (id) => {
        setDeleteConfirm({ isOpen: true, id, type: 'review', loading: false });
    };

    const executeDeleteReview = async () => {
        setDeleteConfirm(prev => ({ ...prev, loading: true }));
        try {
            await reviewService.deleteReview(deleteConfirm.id);
            showSuccessToast("Review deleted");
            setDeleteConfirm({ isOpen: false, id: null, type: null, loading: false });
            fetchReviews();
        } catch (error) {
            showErrorToast("Failed to delete review");
            setDeleteConfirm(prev => ({ ...prev, loading: false }));
        }
    };

    const handleOpenForm = (ad = null) => {
        if (ad) {
            setTitle(ad.title || '');
            setDesc(ad.desc || '');
            setIconName(ad.iconName || 'Globe');
            const foundColor = AVAILABLE_COLORS.find(c => c.value === ad.accent);
            if (foundColor) {
                setColorObj(foundColor);
            } else {
                setColorObj({
                    name: 'Custom',
                    value: ad.accent || '#000000',
                    bg: 'bg-white',
                    border: 'border-slate-200',
                    iconBg: 'custom'
                });
            }
            setPopupLocations(ad.popupLocations ? ad.popupLocations.split(',').map(s => s.trim()) : ['Dashboard']);
            setPopupPlacement(ad.popupPlacement || 'top-right');
            setIsActive(ad.isActive !== undefined ? ad.isActive : true);
            setCurrentAd(ad);
        } else {
            setTitle('');
            setDesc('');
            setIconName('Globe');
            setColorObj(AVAILABLE_COLORS[0]);
            setPopupLocations(['Dashboard']);
            setPopupPlacement('top-right');
            setIsActive(true);
            setCurrentAd(null);
        }
        setIsEditing(true);
    };

    const handleCloseForm = () => {
        setIsEditing(false);
        setCurrentAd(null);
    };

    const handleSubmitAd = async (e) => {
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
            popupLocations: popupLocations.join(', '),
            popupPlacement,
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
            await fetchAds();
            handleCloseForm();
        } catch (error) {
            showErrorToast("Failed to save ad. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdStatus = async (id, status) => {
        try {
            await adService.updateAdStatus(id, status);
            showSuccessToast(`Ad ${status ? 'activated' : 'deactivated'}`);
            fetchAds();
        } catch (error) {
            showErrorToast("Failed to update status");
        }
    };

    const handleDeleteAd = (id) => {
        setDeleteConfirm({ isOpen: true, id, type: 'ad', loading: false });
    };

    const executeDeleteAd = async () => {
        setDeleteConfirm(prev => ({ ...prev, loading: true }));
        try {
            await adService.deleteAd(deleteConfirm.id);
            showSuccessToast("Ad deleted successfully");
            setDeleteConfirm({ isOpen: false, id: null, type: null, loading: false });
            fetchAds();
        } catch (error) {
            showErrorToast("Failed to delete ad");
            setDeleteConfirm(prev => ({ ...prev, loading: false }));
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const filteredReviews = reviews.filter(r =>
        r.empName?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.empCode?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.comment?.toLowerCase().includes(reviewSearch.toLowerCase())
    );

    const filteredAds = ads.filter(a =>
        a.title?.toLowerCase().includes(adSearch.toLowerCase()) ||
        a.desc?.toLowerCase().includes(adSearch.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 mb-6 min-h-[500px]">
                {/* Header Container */}
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-[5px] p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rose-50 flex items-center justify-center rounded-[5px]">
                            <Megaphone className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-800">Employee Engagement Management</h2>
                            <p className="text-[11px] text-slate-500 font-medium">Manage system reviews and promotional advertisements</p>
                        </div>
                    </div>
                        {activeTab === 'ads' && !isEditing && (
                            <div className="flex items-center gap-3 self-start">
                                <button
                                    onClick={() => handleOpenForm()}
                                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-[3px] transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <Plus size={14} />
                                    Create Advertisement
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selector Bar */}
                <div className="bg-white p-4 border border-slate-200/80 flex flex-col gap-4 rounded-[5px] shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">Select View:</span>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-[3px] transition-all ${activeTab === 'reviews'
                                ? 'bg-[#0078d4] text-white shadow-sm border border-[#0078d4]'
                                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
                            }`}
                        >
                            System Reviews
                        </button>
                        <button
                            onClick={() => setActiveTab('ads')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-[3px] transition-all ${activeTab === 'ads'
                                ? 'bg-orange-600 text-white shadow-sm border border-orange-600'
                                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
                            }`}
                        >
                            Advertisements
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={activeTab === 'reviews' ? "Search reviews..." : "Search ads..."}
                            value={activeTab === 'reviews' ? reviewSearch : adSearch}
                            onChange={e => activeTab === 'reviews' ? setReviewSearch(e.target.value) : setAdSearch(e.target.value)}
                            className="pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50 text-slate-800 text-xs w-full outline-none focus:border-[#0078d4] rounded-[3px] transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
                <div className="border border-slate-200 overflow-hidden bg-white rounded-[3px] shadow-sm">
                    <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-black text-slate-600">{averageRating}</span>
                            <span className="text-[10px] text-slate-500 font-medium ml-2 uppercase tracking-widest">{reviews.length} total reviews</span>
                        </div>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Employee</th>
                                    <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Rating</th>
                                    <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Comment</th>
                                    <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Date</th>
                                    <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Status</th>
                                    <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingReviews ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredReviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-[13px] text-slate-500 font-medium">No reviews found.</td>
                                    </tr>
                                ) : (
                                    filteredReviews.map(review => (
                                        <tr key={review.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                            <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                <div className="text-[13px] text-slate-800 font-bold">{review.empName}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{review.empCode}</div>
                                            </td>
                                            <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                <p className="text-[13px] text-slate-600 font-medium truncate" title={review.comment}>
                                                    {review.comment}
                                                </p>
                                            </td>
                                            <td className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[3px] ${
                                                    review.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    review.status === 'Hidden' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                                    'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                    {review.status}
                                                </span>
                                            </td>
                                            <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {review.status !== 'Approved' && (
                                                        <button
                                                            onClick={() => handleReviewStatus(review.id, 'Approved')}
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                    )}
                                                    {review.status !== 'Hidden' && (
                                                        <button
                                                            onClick={() => handleReviewStatus(review.id, 'Hidden')}
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-500 hover:bg-slate-400 rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                                                            title="Hide"
                                                        >
                                                            <EyeOff size={14} /> Hide
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADS TAB */}
            {activeTab === 'ads' && (
                <>
                    {isEditing ? (
                        <div className="border border-slate-200 bg-white rounded-[5px] shadow-sm">
                            <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                <h3 className="text-[15px] font-bold text-slate-800">
                                    {currentAd ? 'Edit Advertisement' : 'Create New Advertisement'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                >
                                    <Megaphone className="w-3.5 h-3.5" /> All Ads
                                </button>
                            </div>
                            <form onSubmit={handleSubmitAd}>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                                placeholder="e.g. Merit Plus Finance"
                                                maxLength={40}
                                            />
                                            <span className="text-[10px] text-slate-500 mt-1 block text-right">{title.length}/40</span>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                            <textarea
                                                value={desc}
                                                onChange={e => setDesc(e.target.value)}
                                                className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                                placeholder="Brief description of the promotion..."
                                                maxLength={300}
                                            />
                                            <span className="text-[10px] text-slate-500 mt-1 block text-right">{desc.length}/300</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Icon</label>
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white border border-slate-200">
                                                {AVAILABLE_ICONS.map(iconOpt => {
                                                    const IconCmp = iconOpt.component;
                                                    return (
                                                        <button
                                                            key={iconOpt.name}
                                                            type="button"
                                                            onClick={() => setIconName(iconOpt.name)}
                                                            className={`p-2 transition-all ${iconName === iconOpt.name ? 'bg-orange-500/20 text-orange-500 ring-2 ring-orange-500/30 border border-orange-500' : 'border border-slate-200 bg-transparent text-slate-500 hover:bg-slate-50'}`}
                                                            title={iconOpt.name}
                                                        >
                                                            <IconCmp size={18} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Accent Color</label>
                                            <div className="p-3 bg-white border border-slate-200 h-full flex flex-col justify-center rounded-[3px]">
                                                <div className="flex flex-wrap gap-2 items-center mb-3">
                                                    {AVAILABLE_COLORS.slice(0, 12).map(c => (
                                                        <button
                                                            key={c.name}
                                                            type="button"
                                                            onClick={() => setColorObj(c)}
                                                            className={`w-7 h-7 rounded-[3px] border-2 transition-all ${colorObj.name === c.name ? 'border-slate-800 scale-110 shadow-md ring-2 ring-blue-500 ring-offset-1' : 'border-transparent hover:scale-110 shadow-sm'}`}
                                                            style={{ backgroundColor: c.value }}
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {AVAILABLE_COLORS.slice(12).map(c => (
                                                        <button
                                                            key={c.name}
                                                            type="button"
                                                            onClick={() => setColorObj(c)}
                                                            className={`w-7 h-7 rounded-[3px] border-2 transition-all ${colorObj.name === c.name ? 'border-slate-800 scale-110 shadow-md ring-2 ring-blue-500 ring-offset-1' : 'border-transparent hover:scale-110 shadow-sm'}`}
                                                            style={{ backgroundColor: c.value }}
                                                            title={c.name}
                                                        />
                                                    ))}
                                                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                                    <label
                                                        className={`w-7 h-7 rounded-[3px] border-2 relative cursor-pointer transition-all overflow-hidden ${colorObj.name === 'Custom' ? 'border-slate-800 scale-110 shadow-md ring-2 ring-blue-500 ring-offset-1' : 'border-slate-200 hover:scale-110 shadow-sm'}`}
                                                        style={{ 
                                                            backgroundColor: colorObj.name === 'Custom' ? colorObj.value : '#e2e8f0',
                                                            backgroundImage: colorObj.name !== 'Custom' ? 'conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)' : 'none'
                                                        }}
                                                        title="Custom Color"
                                                    >
                                                        <input type="color" value={colorObj.value}
                                                            onChange={(e) => setColorObj({ name: 'Custom', value: e.target.value, bg: 'bg-white', border: 'border-slate-200', iconBg: 'custom' })}
                                                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Show On Pages</label>
                                            <button type="button"
                                                onClick={() => setPopupLocations(popupLocations.length === AVAILABLE_LOCATIONS.length ? [] : [...AVAILABLE_LOCATIONS])}
                                                className="text-[10px] font-bold text-orange-500 hover:text-orange-400 transition-colors"
                                            >
                                                {popupLocations.length === AVAILABLE_LOCATIONS.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                                            {AVAILABLE_LOCATIONS.map(loc => {
                                                const isSelected = popupLocations.includes(loc);
                                                return (
                                                    <label key={loc}
                                                        className={`flex items-center gap-2 px-2.5 py-2 border cursor-pointer transition-all duration-200 rounded-[3px] ${
                                                            isSelected
                                                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-600 shadow-sm'
                                                                : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className={`w-3.5 h-3.5 flex items-center justify-center transition-all duration-200 rounded-[2px] ${
                                                            isSelected
                                                                ? 'bg-orange-500 text-white'
                                                                : 'bg-white border border-slate-200'
                                                        }`}>
                                                            {isSelected && (
                                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <input type="checkbox" className="hidden"
                                                            checked={isSelected}
                                                            onChange={(e) => setPopupLocations(e.target.checked ? [...popupLocations, loc] : popupLocations.filter(l => l !== loc))}
                                                        />
                                                        <span className="text-[11px] font-semibold">{loc}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Popup Position</label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {PLACEMENT_OPTIONS.map(opt => {
                                                const isSelected = popupPlacement === opt.id;
                                                return (
                                                    <button key={opt.id} type="button" onClick={() => setPopupPlacement(opt.id)}
                                                        className={`flex flex-col items-center gap-0.5 px-2 py-2 border transition-all duration-200 rounded-[3px] ${
                                                            isSelected
                                                                ? 'border-orange-500/50 bg-orange-500/20 text-orange-600 shadow-sm'
                                                                : 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span className="text-base leading-none">{opt.icon}</span>
                                                        <span className="text-[9px] font-bold whitespace-nowrap">{opt.label}</span>
                                                        {isSelected && (
                                                            <div className="w-1 h-1 rounded-[2px] bg-orange-500 mt-0.5" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-[3px] peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-[3px] after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                </label>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800">Active Advertisement</span>
                                                    <p className="text-xs text-slate-500">Visible to users on selected pages</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                    <button type="button" onClick={handleCloseForm} disabled={isSubmitting}
                                        className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white font-bold transition-all disabled:opacity-50 text-xs min-w-[140px] rounded-[3px] shadow-sm"
                                    >
                                        {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Advertisement</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="border border-slate-200 overflow-hidden bg-white rounded-[3px] shadow-sm">
                            <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <Megaphone className="w-3 h-3 text-orange-500" />
                                    <span className="text-xs font-black text-slate-600">Promotional Ads</span>
                                    <span className="text-[10px] text-slate-500 font-medium ml-2 uppercase tracking-widest">{ads.length} active ads</span>
                                </div>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Advertisement</th>
                                            <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Locations</th>
                                            <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Accent</th>
                                            <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Status</th>
                                            <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loadingAds ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-500">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                                </td>
                                            </tr>
                                        ) : filteredAds.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-[13px] text-slate-500 font-medium">No advertisements found.</td>
                                            </tr>
                                        ) : (
                                            filteredAds.map(ad => {
                                                const iconOpt = AVAILABLE_ICONS.find(i => i.name === ad.iconName) || AVAILABLE_ICONS[3];
                                                const IconCmp = iconOpt.component;
                                                return (
                                                    <tr key={ad.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                                        <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                            <div className="flex items-center gap-3">
                                                                <div 
                                                                    className={`w-8 h-8 flex items-center justify-center shrink-0 ${ad.iconBg && ad.iconBg !== 'custom' ? ad.iconBg : 'bg-slate-100'}`}
                                                                    style={ad.iconBg === 'custom' ? { backgroundColor: ad.accent } : {}}
                                                                >
                                                                    <IconCmp size={14} className="text-slate-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[13px] text-slate-800 font-bold">{ad.title}</div>
                                                                    <div className="text-[11px] text-slate-500 font-medium truncate max-w-md">{ad.desc}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                            <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                                                                {ad.popupLocations ? (() => {
                                                                    const locs = ad.popupLocations.split(',').map(s => s.trim());
                                                                    if (locs.length === AVAILABLE_LOCATIONS.length) {
                                                                        return <span className="px-6 h-10 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-[3px] hover:bg-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-indigo-100">All Pages</span>;
                                                                    }
                                                                    return locs.map((loc, i) => (
                                                                        <span key={i} className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                                                            {loc}
                                                                        </span>
                                                                    ));
                                                                })() : <span className="text-[11px] text-slate-500 font-medium">None</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 rounded-[3px] border border-slate-200" style={{ backgroundColor: ad.accent || '#78716c' }} />
                                                                <span className="text-[11px] font-medium text-slate-500">{ad.accent || '#78716c'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[3px] ${
                                                                ad.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                                            }`}>
                                                                {ad.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => handleAdStatus(ad.id, !ad.isActive)}
                                                                    className={`px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-[3px] transition-all flex items-center justify-center w-[90px] gap-1.5 ${ad.isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                                                    title={ad.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {ad.isActive ? <><XCircle size={14} /> Deactivate</> : <><CheckCircle size={14} /> Activate</>}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOpenForm(ad)}
                                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#0285fd] hover:bg-[#0073ff] rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={14} /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAd(ad.id)}
                                                                    className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={14} /> Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            </div>

            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, type: null, loading: false })}
                onConfirm={deleteConfirm.type === 'review' ? executeDeleteReview : executeDeleteAd}
                title={`Delete ${deleteConfirm.type === 'review' ? 'Review' : 'Advertisement'}`}
                message={`Are you sure you want to permanently delete this ${deleteConfirm.type === 'review' ? 'review' : 'advertisement'}? This action cannot be undone.`}
                loading={deleteConfirm.loading}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
};

export default EngagementAdminBoard;





