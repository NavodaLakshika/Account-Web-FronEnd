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
    { name: 'Amber', value: '#f59e0b', bg: 'bg-blue-500/20', border: 'border-amber-500/50', iconBg: 'bg-blue-500' },
    { name: 'Lime', value: '#84cc16', bg: 'bg-lime-500/20', border: 'border-lime-500/50', iconBg: 'bg-lime-500' },
    { name: 'Fuchsia', value: '#d946ef', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/50', iconBg: 'bg-fuchsia-500' },
    { name: 'Violet', value: '#8b5cf6', bg: 'bg-violet-500/20', border: 'border-violet-500/50', iconBg: 'bg-violet-500' },
    { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', iconBg: 'bg-yellow-500' },
    { name: 'Sky', value: '#0ea5e9', bg: 'bg-sky-500/20', border: 'border-sky-500/50', iconBg: 'bg-sky-500' },
    { name: 'Slate', value: '#64748b', bg: 'bg-transparent0/20', border: 'border-slate-500/50', iconBg: 'bg-transparent0' },
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
                    border: 'border-gray-100',
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
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-rose-50 flex items-center justify-center rounded-lg border border-rose-100 shadow-sm">
                                <Megaphone className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">Employee Engagement Management</h2>
                                <p className="text-[12px] text-gray-500 font-medium">Manage system reviews and promotional advertisements</p>
                            </div>
                        </div>
                        {activeTab === 'ads' && !isEditing && (
                            <button
                                onClick={() => handleOpenForm()}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Plus size={14} />
                                Create Advertisement
                            </button>
                        )}
                    </div>
                </div>

                {/* Selector Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-nowrap items-center bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex-1 md:flex-none text-center whitespace-nowrap ${activeTab === 'reviews'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                                    }`}
                            >
                                System Reviews
                            </button>
                            <button
                                onClick={() => setActiveTab('ads')}
                                className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex-1 md:flex-none text-center whitespace-nowrap ${activeTab === 'ads'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                                    }`}
                            >
                                Advertisements
                            </button>
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={activeTab === 'reviews' ? "Search system reviews..." : "Search advertisements..."}
                                value={activeTab === 'reviews' ? reviewSearch : adSearch}
                                onChange={e => activeTab === 'reviews' ? setReviewSearch(e.target.value) : setAdSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 bg-white shadow-sm text-gray-800 text-xs w-full outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* REVIEWS TAB (Metro Grid Layout) */}
                {activeTab === 'reviews' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="flex items-center justify-between text-gray-600 px-2">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-[15px] font-black">{averageRating}</span>
                                <span className="text-gray-300 mx-2">|</span>
                                <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">{reviews.length} TOTAL REVIEWS</span>
                            </div>
                        </div>

                        {loadingReviews ? (
                            <div className="py-16 text-center text-gray-500 flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                <span className="text-[12px] font-bold">Loading reviews matrix...</span>
                            </div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center">
                                <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-[15px] font-bold text-gray-700">No Reviews Found</h3>
                                <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                                    No user feedback matches your current filters.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredReviews.map(review => (
                                    <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                                        <div className="p-5 border-b border-gray-50 flex items-center justify-between relative bg-gradient-to-b from-gray-50/50 to-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center rounded-full text-indigo-600 font-black text-sm border border-indigo-100">
                                                    {(review.empName || 'U')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-[13px] font-bold text-gray-800 leading-tight uppercase group-hover:text-blue-600 transition-colors line-clamp-1">{review.empName}</h3>
                                                    <span className="text-[10px] font-mono font-bold text-indigo-500">{review.empCode}</span>
                                                </div>
                                            </div>
                                            <span className={`absolute top-4 right-4 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[4px] shadow-sm ${review.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    review.status === 'Hidden' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                                                        'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                {review.status}
                                            </span>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col gap-3">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-500' : 'text-gray-200 fill-gray-100'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-[13px] text-gray-600 font-medium italic leading-relaxed flex-1">"{review.comment}"</p>
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex items-center gap-2 justify-end shrink-0">
                                            {review.status !== 'Approved' && (
                                                <button
                                                    onClick={() => handleReviewStatus(review.id, 'Approved')}
                                                    className="flex-1 py-1.5 px-2 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-[6px] shadow-sm transition-all flex items-center justify-center gap-1.5"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                            )}
                                            {review.status !== 'Hidden' && (
                                                <button
                                                    onClick={() => handleReviewStatus(review.id, 'Hidden')}
                                                    className="flex-1 py-1.5 px-2 text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-[6px] shadow-sm transition-all flex items-center justify-center gap-1.5"
                                                    title="Hide"
                                                >
                                                    <EyeOff size={14} /> Hide
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="flex-1 py-1.5 px-2 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[6px] shadow-sm transition-all flex items-center justify-center gap-1.5"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} /> Toss
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ADS TAB */}
                {activeTab === 'ads' && (
                    <>
                        {isEditing ? (
                            <div className="border border-gray-100 bg-white rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <div className="px-6 h-12 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                                    <h3 className="text-[15px] font-bold text-blue-800 flex items-center gap-2">
                                        <Megaphone className="w-4 h-4 text-blue-600" />
                                        {currentAd ? 'Edit Advertisement Data' : 'Create New Advertisement Configuration'}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 p-1.5 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmitAd}>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={e => setTitle(e.target.value)}
                                                    className="w-full px-4 h-11 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-[13px] font-bold text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:font-normal placeholder:text-gray-400"
                                                    placeholder="e.g. Merit Plus Finance Promo"
                                                    maxLength={40}
                                                />
                                                <span className="text-[10px] text-gray-400 mt-1 block text-right font-medium">{title.length}/40 limit</span>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                                <textarea
                                                    value={desc}
                                                    onChange={e => setDesc(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-[13px] font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 min-h-[44px] h-11 resize-y"
                                                    placeholder="Brief description of the promotion..."
                                                    maxLength={300}
                                                />
                                                <span className="text-[10px] text-gray-400 mt-1 block text-right font-medium">{desc.length}/300 limit</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Display Icon</label>
                                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                                    {AVAILABLE_ICONS.map(iconOpt => {
                                                        const IconCmp = iconOpt.component;
                                                        return (
                                                            <button
                                                                key={iconOpt.name}
                                                                type="button"
                                                                onClick={() => setIconName(iconOpt.name)}
                                                                className={`p-2 transition-all rounded-lg ${iconName === iconOpt.name ? 'bg-white text-blue-600 shadow-sm border border-blue-400' : 'border border-transparent bg-transparent text-gray-500 hover:bg-white hover:border-gray-200'}`}
                                                                title={iconOpt.name}
                                                            >
                                                                <IconCmp size={18} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Accent Rendering Color</label>
                                                <div className="p-4 bg-gray-50 border border-gray-200 h-full flex flex-col justify-center rounded-xl">
                                                    <div className="flex flex-wrap gap-2 items-center mb-3">
                                                        {AVAILABLE_COLORS.slice(0, 12).map(c => (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={() => setColorObj(c)}
                                                                className={`w-7 h-7 rounded-full border-[3px] transition-all object-cover ${colorObj.name === c.name ? 'border-white scale-110 shadow-md ring-2 ring-blue-500 ring-offset-1' : 'border-transparent hover:scale-110 shadow-[0_2px_4px_rgba(0,0,0,0.1)]'}`}
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
                                                                className={`w-7 h-7 rounded-full border-[3px] transition-all object-cover ${colorObj.name === c.name ? 'border-white scale-110 shadow-md ring-2 ring-blue-500 ring-offset-1' : 'border-transparent hover:scale-110 shadow-[0_2px_4px_rgba(0,0,0,0.1)]'}`}
                                                                style={{ backgroundColor: c.value }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                                                        <label
                                                            className={`w-7 h-7 rounded-full border-[3px] relative cursor-pointer transition-all overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.1)] ${colorObj.name === 'Custom' ? 'border-white scale-110 ring-2 ring-blue-500 ring-offset-1' : 'border-transparent hover:scale-110'}`}
                                                            style={{
                                                                backgroundColor: colorObj.name === 'Custom' ? colorObj.value : '#e2e8f0',
                                                                backgroundImage: colorObj.name !== 'Custom' ? 'conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)' : 'none'
                                                            }}
                                                            title="Custom Color"
                                                        >
                                                            <input type="color" value={colorObj.value}
                                                                onChange={(e) => setColorObj({ name: 'Custom', value: e.target.value, bg: 'bg-white', border: 'border-gray-100', iconBg: 'custom' })}
                                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Show On System Pages</label>
                                                <button type="button"
                                                    onClick={() => setPopupLocations(popupLocations.length === AVAILABLE_LOCATIONS.length ? [] : [...AVAILABLE_LOCATIONS])}
                                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-500 transition-colors bg-blue-50 px-2 py-0.5 rounded"
                                                >
                                                    {popupLocations.length === AVAILABLE_LOCATIONS.length ? 'Deselect All' : 'Select All Locations'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                                {AVAILABLE_LOCATIONS.map(loc => {
                                                    const isSelected = popupLocations.includes(loc);
                                                    return (
                                                        <label key={loc}
                                                            className={`flex items-center gap-2 px-3 py-2 border cursor-pointer transition-all duration-200 rounded-lg ${isSelected
                                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-white'
                                                                }`}
                                                        >
                                                            <div className={`w-3.5 h-3.5 flex items-center justify-center transition-all duration-200 rounded-[3px] ${isSelected
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-white border border-gray-300'
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
                                                            <span className="text-[11px] font-bold leading-tight">{loc}</span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Target Coordinate Placement</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {PLACEMENT_OPTIONS.map(opt => {
                                                    const isSelected = popupPlacement === opt.id;
                                                    return (
                                                        <button key={opt.id} type="button" onClick={() => setPopupPlacement(opt.id)}
                                                            className={`flex flex-col items-center gap-1.5 p-3 border transition-all duration-200 rounded-lg ${isSelected
                                                                    ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-400'
                                                                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-white'
                                                                }`}
                                                        >
                                                            <span className="text-xl leading-none font-black">{opt.icon}</span>
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">{opt.label}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-4 bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-sm border border-gray-100"></div>
                                                </label>
                                                <div>
                                                    <span className="text-[14px] font-bold text-emerald-800 tracking-tight">Active Advertisement Sequence</span>
                                                    <p className="text-[11px] text-emerald-600/80 font-medium">This module will be immediately visible to system users upon save</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-2xl">
                                        <button type="button" onClick={handleCloseForm} disabled={isSubmitting}
                                            className="px-6 h-10 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            Discard Payload
                                        </button>
                                        <button type="submit" disabled={isSubmitting}
                                            className="flex items-center justify-center gap-2 px-8 h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 text-xs rounded-lg shadow-md"
                                        >
                                            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving Configuration...</> : <><Save size={16} /> Save Advertisement Settings</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {loadingAds ? (
                                    <div className="py-16 text-center text-gray-500 flex flex-col items-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                        <span className="text-[12px] font-bold">Loading advertisements payload...</span>
                                    </div>
                                ) : filteredAds.length === 0 ? (
                                    <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center">
                                        <Megaphone className="w-12 h-12 text-gray-300 mb-4" />
                                        <h3 className="text-[15px] font-bold text-gray-700">No Advertisements Found</h3>
                                        <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                                            No promotional media matches your active filters.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in transition-all">
                                        {filteredAds.map(ad => {
                                            const iconOpt = AVAILABLE_ICONS.find(i => i.name === ad.iconName) || AVAILABLE_ICONS[3];
                                            const IconCmp = iconOpt.component;
                                            return (
                                                <div key={ad.id} className={`bg-white rounded-2xl border ${ad.isActive ? 'border-blue-100' : 'border-gray-100 bg-gray-50/30'} shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col`}>
                                                    <div className="p-5 border-b border-gray-50 flex items-center justify-between relative bg-gradient-to-b from-gray-50/50 to-white">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-gray-100 ${!ad.iconBg || ad.iconBg === 'custom' ? '' : ad.iconBg}`}
                                                                style={ad.iconBg === 'custom' || !ad.iconBg ? { backgroundColor: ad.accent || '#3b82f6', color: '#fff' } : {}}
                                                            >
                                                                <IconCmp size={18} className={ad.iconBg === 'custom' || !ad.iconBg ? 'text-white' : 'text-white'} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-[14px] font-bold text-gray-800 leading-tight uppercase group-hover:text-blue-600 transition-colors line-clamp-1">{ad.title}</h3>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-5 flex-1 flex flex-col gap-3">
                                                        <p className="text-[12px] text-gray-600 font-medium line-clamp-3 mb-2 flex-1">{ad.desc}</p>

                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Targeting Hooks</span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {ad.popupLocations ? (() => {
                                                                    const locs = ad.popupLocations.split(',').map(s => s.trim());
                                                                    if (locs.length === AVAILABLE_LOCATIONS.length) {
                                                                        return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded shadow-sm border border-indigo-100">ALL SYSTEM PAGES</span>;
                                                                    }
                                                                    return locs.map((loc, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold uppercase rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-gray-100">
                                                                            {loc}
                                                                        </span>
                                                                    ));
                                                                })() : <span className="text-[9px] text-gray-400 font-medium">None</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 border-t border-gray-50 flex items-center gap-2 justify-end shrink-0 bg-gray-50/50">
                                                        <div className="mr-auto">
                                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${ad.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                                                                }`}>
                                                                {ad.isActive ? 'Active Node' : 'Suspended'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAdStatus(ad.id, !ad.isActive)}
                                                            className={`w-8 h-8 rounded-lg shadow-sm transition-all flex items-center justify-center ${ad.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                                                            title={ad.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {ad.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenForm(ad)}
                                                            className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg shadow-sm transition-all flex items-center justify-center"
                                                            title="Edit Configurations"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAd(ad.id)}
                                                            className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg shadow-sm transition-all flex items-center justify-center"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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
                confirmText="Delete Object"
                cancelText="Keep"
                variant="danger"
            />
        </>
    );
};

export default EngagementAdminBoard;
