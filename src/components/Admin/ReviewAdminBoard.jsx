import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Eye, EyeOff, CheckCircle, Clock, Loader2, X } from 'lucide-react';
import { reviewService } from '../../services/review.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const ReviewAdminBoard = ({ isOpen, onClose, inlineView }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen || inlineView) {
            fetchReviews();
        }
    }, [isOpen, inlineView]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await reviewService.getAllReviews();
            setReviews(data);
        } catch (error) {
            showErrorToast("Failed to fetch reviews");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await reviewService.updateReviewStatus(id, newStatus);
            showSuccessToast(`Review marked as ${newStatus}`);
            fetchReviews(); // Refresh
        } catch (error) {
            showErrorToast("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
        
        try {
            await reviewService.deleteReview(id);
            showSuccessToast("Review deleted");
            fetchReviews();
        } catch (error) {
            showErrorToast("Failed to delete review");
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (!isOpen && !inlineView) return null;

    const Content = (
        <div className={inlineView ? "flex flex-col h-full animate-in fade-in duration-300" : "bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"}>
            {/* Header */}
                <div className={inlineView ? "flex items-center justify-between mb-6" : "flex items-center justify-between p-6 border-b border-slate-200 bg-white"}>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="text-[#00acee]" size={20} />
                            System Reviews
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage feedback and ratings submitted by employees.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-[3px] border border-slate-200 dark:border-slate-600">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-lg font-black text-slate-900 dark:text-white">{averageRating}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{reviews.length} reviews</span>
                        </div>
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

                <div className={inlineView ? "flex-1 overflow-y-auto" : "p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/20"}>
 <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Employee</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Rating</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Comment</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Date</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Status</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 px-6 text-center text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                                        Loading reviews...
                                    </td>
                                <th className="text-right px-5 py-3">Action</th></tr>
                            ) : reviews.map(review => (
                                <tr key={review.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-slate-900 dark:text-white">{review.empName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{review.empCode}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-600 fill-slate-50 dark:fill-slate-700'}`} 
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 max-w-md">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate" title={review.comment}>
                                            {review.comment}
                                        </p>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                                            review.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                            review.status === 'Hidden' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400' :
                                            'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {review.status === 'Pending' && <Clock className="w-3 h-3" />}
                                            {review.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                                            {review.status === 'Hidden' && <EyeOff className="w-3 h-3" />}
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {review.status !== 'Approved' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(review.id, 'Approved')}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-[3px] transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {review.status !== 'Hidden' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(review.id, 'Hidden')}
                                                    className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-[3px] transition-colors"
                                                    title="Hide"
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[3px] transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && reviews.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 px-6 text-center text-slate-400 dark:text-slate-500 font-medium">
                                        No reviews submitted yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                        </div>
                    </div>
                </div>
            </div>
    );

    if (inlineView) return Content;

    return (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm overflow-y-auto">
            {Content}
        </div>
    );
};

export default ReviewAdminBoard;
