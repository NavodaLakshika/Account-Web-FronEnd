import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, Megaphone, Star, Search, Trash2, EyeOff, CheckCircle, Clock, 
    Loader2, Plus, Edit, XCircle, Save, Database, Layout, Cpu, Globe, 
    Gift, Zap, TrendingUp, Shield, ShoppingCart, Users, Briefcase, Award, Crown, Heart, Smartphone, Monitor,
    Coffee, Music, Video, Camera, Headphones, Map, MapPin, Truck, Box, Calendar, Activity, Anchor,
    AlertCircle, AlertTriangle, Bell, Bookmark, CalendarDays, CameraOff, Cast, Cloud, CloudRain, 
    CloudSnow, CloudLightning, Compass, Crosshair, Download, Upload, Flag, Folder, Image as ImageIcon, Key, Link
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
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-500' },
    { name: 'Emerald', value: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-500' },
    { name: 'Purple', value: '#7c3aed', bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-500' },
    { name: 'Stone', value: '#78716c', bg: 'bg-stone-50', border: 'border-stone-200', iconBg: 'bg-stone-500' },
    { name: 'Red', value: '#ef4444', bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-500' },
    { name: 'Orange', value: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-500' },
    { name: 'Pink', value: '#ec4899', bg: 'bg-pink-50', border: 'border-pink-200', iconBg: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-500' },
    { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-50', border: 'border-cyan-200', iconBg: 'bg-cyan-500' },
    { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-50', border: 'border-teal-200', iconBg: 'bg-teal-500' },
    { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-500' },
    { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500' },
    { name: 'Lime', value: '#84cc16', bg: 'bg-lime-50', border: 'border-lime-200', iconBg: 'bg-lime-500' },
    { name: 'Fuchsia', value: '#d946ef', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', iconBg: 'bg-fuchsia-500' },
    { name: 'Violet', value: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-200', iconBg: 'bg-violet-500' },
    { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-50', border: 'border-yellow-200', iconBg: 'bg-yellow-500' },
    { name: 'Sky', value: '#0ea5e9', bg: 'bg-sky-50', border: 'border-sky-200', iconBg: 'bg-sky-500' },
    { name: 'Slate', value: '#64748b', bg: 'bg-slate-50', border: 'border-slate-200', iconBg: 'bg-slate-500' },
    { name: 'Navy', value: '#1e3a8a', bg: 'bg-blue-100', border: 'border-blue-300', iconBg: 'bg-blue-900' },
    { name: 'Crimson', value: '#7f1d1d', bg: 'bg-red-100', border: 'border-red-300', iconBg: 'bg-red-900' },
    { name: 'Forest', value: '#064e3b', bg: 'bg-emerald-100', border: 'border-emerald-300', iconBg: 'bg-emerald-900' },
    { name: 'Chocolate', value: '#78350f', bg: 'bg-amber-100', border: 'border-amber-300', iconBg: 'bg-amber-900' },
    { name: 'Grape', value: '#581c87', bg: 'bg-purple-100', border: 'border-purple-300', iconBg: 'bg-purple-900' },
    { name: 'Charcoal', value: '#0f172a', bg: 'bg-slate-200', border: 'border-slate-400', iconBg: 'bg-slate-900' },
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
    { id: 'top-left', label: 'Top Left', icon: '↖️' },
    { id: 'top-center', label: 'Top Center', icon: '⬆️' },
    { id: 'top-right', label: 'Top Right', icon: '↗️' },
    { id: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
    { id: 'bottom-center', label: 'Bottom Center', icon: '⬇️' },
    { id: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
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
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 flex items-center justify-center">
                        <Megaphone className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800">Engagement Management</h2>
                        <p className="text-[11px] text-slate-500 font-medium">Manage system reviews and promotional advertisements</p>
                    </div>
                </div>
                <div className="flex bg-slate-200/50 p-1 rounded-[12px]">
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${activeTab === 'reviews' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <MessageSquare className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        System Reviews
                    </button>
                    <button
                        onClick={() => setActiveTab('ads')}
                        className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${activeTab === 'ads' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Megaphone className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Advertisements
                    </button>
                </div>
            </div>

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
                <div className="w-full flex flex-col flex-1 h-full min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-lg font-black text-slate-800">{averageRating}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">{reviews.length} reviews</span>
                        </div>
                        <div className="relative w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-100/60 border border-slate-200/60 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4]"
                                value={reviewSearch}
                                onChange={e => setReviewSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 bg-white shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Employee</th>
                                        <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Rating</th>
                                        <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Comment</th>
                                        <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Date</th>
                                        <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Status</th>
                                        <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingReviews ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-slate-400">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    ) : filteredReviews.map(review => (
                                        <tr key={review.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-6">
                                                <div className="text-[13px] text-slate-900 font-bold">{review.empName}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{review.empCode}</div>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-50'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 max-w-md">
                                                <p className="text-[13px] text-slate-700 font-medium truncate" title={review.comment}>
                                                    {review.comment}
                                                </p>
                                            </td>
                                            <td className="py-3.5 px-6 text-[13px] text-slate-500 font-medium">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                    review.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    review.status === 'Hidden' ? 'bg-slate-100 text-slate-600' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {review.status === 'Pending' && <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                                    {review.status === 'Approved' && <CheckCircle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                                    {review.status === 'Hidden' && <EyeOff className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                                    {review.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {review.status !== 'Approved' && (
                                                        <button
                                                            onClick={() => handleReviewStatus(review.id, 'Approved')}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-[12px] transition-all"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-[18px] h-[18px]" />
                                                        </button>
                                                    )}
                                                    {review.status !== 'Hidden' && (
                                                        <button
                                                            onClick={() => handleReviewStatus(review.id, 'Hidden')}
                                                            className="p-1.5 text-slate-400 hover:text-[#0078d4] hover:bg-blue-50 rounded-[12px] transition-all"
                                                            title="Hide"
                                                        >
                                                            <EyeOff className="w-[18px] h-[18px]" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[12px] transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-[18px] h-[18px]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loadingReviews && filteredReviews.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-[13px] text-slate-400 font-medium">No reviews found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ADS TAB */}
            {activeTab === 'ads' && (
                <div className="w-full flex flex-col flex-1 h-full min-h-0">
                    {isEditing ? (
                        <>
                            <div className="flex-1 overflow-y-auto">
                                <div className="bg-white shadow-sm border border-slate-200/60 overflow-hidden w-full mb-4">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="text-[15px] font-bold text-slate-800">
                                            {currentAd ? 'Edit Advertisement' : 'Create New Advertisement'}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleCloseForm}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                                        >
                                            <Megaphone className="w-3.5 h-3.5 inline mr-1.5" /> All Ads
                                        </button>
                                    </div>
                                 <form onSubmit={handleSubmitAd}>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Title</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={e => setTitle(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
                                                    placeholder="e.g. Merit Plus Finance"
                                                    maxLength={40}
                                                />
                                                <span className="text-[10px] text-slate-400 mt-1 block text-right">{title.length}/40</span>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
                                                <textarea
                                                    value={desc}
                                                    onChange={e => setDesc(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition-all resize-none h-24"
                                                    placeholder="Brief description of the promotion..."
                                                    maxLength={100}
                                                />
                                                <span className="text-[10px] text-slate-400 mt-1 block text-right">{desc.length}/100</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Icon</label>
                                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-[3px] border border-slate-200">
                                                    {AVAILABLE_ICONS.map(iconOpt => {
                                                        const IconCmp = iconOpt.component;
                                                        return (
                                                            <button
                                                                key={iconOpt.name}
                                                                type="button"
                                                                onClick={() => setIconName(iconOpt.name)}
                                                                className={`p-2 rounded-[3px] border transition-all ${iconName === iconOpt.name ? 'border-orange-500 bg-white text-orange-600 ring-2 ring-orange-200 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:border-slate-300'}`}
                                                                title={iconOpt.name}
                                                            >
                                                                <IconCmp size={18} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Accent Color</label>
                                                <div className="p-3 bg-slate-50 rounded-[3px] border border-slate-200 h-full flex flex-col justify-center">
                                                    <div className="flex flex-wrap gap-2 items-center mb-3">
                                                        {AVAILABLE_COLORS.slice(0, 12).map(c => (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={() => setColorObj(c)}
                                                                className={`w-7 h-7 rounded-full border-2 transition-all ${colorObj.name === c.name ? 'border-slate-800 scale-110 shadow-md ring-2 ring-slate-200 ring-offset-1' : 'border-transparent hover:scale-110 shadow-sm'}`}
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
                                                                className={`w-7 h-7 rounded-full border-2 transition-all ${colorObj.name === c.name ? 'border-slate-800 scale-110 shadow-md ring-2 ring-slate-200 ring-offset-1' : 'border-transparent hover:scale-110 shadow-sm'}`}
                                                                style={{ backgroundColor: c.value }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                        <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                                        <label className={`w-7 h-7 rounded-full border-2 relative cursor-pointer transition-all overflow-hidden ${colorObj.name === 'Custom' ? 'border-slate-800 scale-110 shadow-md ring-2 ring-slate-200 ring-offset-1' : 'border-slate-300 hover:scale-110 shadow-sm'}`}
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
                                                    className="text-[10px] font-bold text-orange-600 hover:text-orange-800 transition-colors"
                                                >
                                                    {popupLocations.length === AVAILABLE_LOCATIONS.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                                                {AVAILABLE_LOCATIONS.map(loc => {
                                                    const isSelected = popupLocations.includes(loc);
                                                    return (
                                                        <label key={loc}
                                                            className={`flex items-center gap-2 px-2.5 py-2 rounded-[3px] border cursor-pointer transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-sm'
                                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'bg-orange-500 text-white'
                                                                    : 'bg-slate-100 border border-slate-300'
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
                                                            className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-[3px] border-2 transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                                                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <span className="text-base leading-none">{opt.icon}</span>
                                                            <span className="text-[9px] font-bold whitespace-nowrap">{opt.label}</span>
                                                            {isSelected && (
                                                                <div className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />
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
                                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-700">Active Advertisement</span>
                                                        <p className="text-xs text-slate-500">Visible to users on selected pages</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                                        <button type="button" onClick={handleCloseForm} disabled={isSubmitting}
                                            className="px-5 py-2.5 bg-white text-slate-700 font-bold border border-slate-300 hover:bg-slate-100 text-xs transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={isSubmitting}
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0078d4] text-white font-bold hover:bg-[#005a9e] transition-all disabled:opacity-50 text-xs min-w-[140px]"
                                        >
                                            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Advertisement</>}
                                        </button>
                                    </div>
                                 </form>
                            </div>
                        </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div className="relative w-64">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search ads..."
                                        className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-100/60 border border-slate-200/60 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4]"
                                        value={adSearch}
                                        onChange={e => setAdSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => handleOpenForm()}
                                    className="flex items-center gap-2 bg-[#0078d4] hover:bg-[#005a9e] text-white px-4 py-2 text-xs font-bold transition-all shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add New Ad
                                </button>
                            </div>

                            <div className="flex-1 bg-white shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Advertisement</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Locations</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Accent</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Status</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                                    {loadingAds ? (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-slate-400">
                                                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                                    </td>
                                                <th className="text-right px-5 py-3">Action</th></tr>
                                            ) : filteredAds.length > 0 ? filteredAds.map(ad => {
                                                const iconOpt = AVAILABLE_ICONS.find(i => i.name === ad.iconName) || AVAILABLE_ICONS[3];
                                                const IconCmp = iconOpt.component;
                                                return (
                                                    <tr key={ad.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div 
                                                                    className={`w-8 h-8 flex items-center justify-center shrink-0 ${ad.iconBg && ad.iconBg !== 'custom' ? ad.iconBg : 'bg-slate-500'}`}
                                                                    style={ad.iconBg === 'custom' ? { backgroundColor: ad.accent } : {}}
                                                                >
                                                                    <IconCmp size={14} className="text-white" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[13px] text-slate-900 font-bold">{ad.title}</div>
                                                                    <div className="text-[11px] text-slate-500 font-medium truncate max-w-md">{ad.desc}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                                                                {ad.popupLocations ? (() => {
                                                                    const locs = ad.popupLocations.split(',').map(s => s.trim());
                                                                    if (locs.length === AVAILABLE_LOCATIONS.length) {
                                                                        return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold">All Pages</span>;
                                                                    }
                                                                    return locs.map((loc, i) => (
                                                                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold">
                                                                            {loc}
                                                                        </span>
                                                                    ));
                                                                })() : <span className="text-[11px] text-slate-400 font-medium">None</span>}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: ad.accent || '#78716c' }} />
                                                                <span className="text-[11px] font-medium text-slate-500">{ad.accent || '#78716c'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                                ad.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {ad.isActive ? <CheckCircle className="w-3 h-3 inline mr-1 -mt-0.5" /> : <XCircle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                                                {ad.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => handleAdStatus(ad.id, !ad.isActive)}
                                                                    className={`p-1.5 rounded-[12px] transition-all ${ad.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                                    title={ad.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {ad.isActive ? <XCircle className="w-[18px] h-[18px]" /> : <CheckCircle className="w-[18px] h-[18px]" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOpenForm(ad)}
                                                                    className="p-1.5 text-slate-400 hover:text-[#0078d4] hover:bg-blue-50 rounded-[12px] transition-all"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-[18px] h-[18px]" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAd(ad.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[12px] transition-all"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-[18px] h-[18px]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-[13px] text-slate-400 font-medium">No advertisements found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

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
        </div>
    );
};

export default EngagementAdminBoard;
