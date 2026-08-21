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
        <div className={inlineView ? "flex flex-col h-full animate-in fade-in duration-300" : "bg-transparent rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"}>
            {/* Header */}
                <div className={inlineView ? "flex items-center justify-between mb-6" : "flex items-center justify-between p-6 border-b border-gray-100 bg-white"}>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-gray-800 dark:text-white flex items-center gap-2">
                            <MessageSquare className="text-[#00acee]" size={20} />
                            System Reviews
                        </h2>
                        <p className="text-gray-500 dark:text-gray-500 dark:text-slate-400 text-xs mt-1">Manage feedback and ratings submitted by employees.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-lg font-black text-slate-900 dark:text-gray-800 dark:text-white">{averageRating}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-500 dark:text-slate-400">{reviews.length} reviews</span>
                        </div>
                        {!inlineView && (
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-gray-500 transition-colors"
                            >
                                <X size={28} strokeWidth={1.5} className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                <div className={inlineView ? "flex-1 overflow-y-auto" : "p-6 overflow-y-auto flex-1 bg-transparent dark:bg-slate-100 dark:bg-slate-900/20"}>
 <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-transparent/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">Employee</th>
                                <th className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">Rating</th>
                                <th className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">Comment</th>
                                <th className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">Date</th>
                                <th className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">Status</th>
                                <th className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                                        Loading reviews...
                                    </td>
                                <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Action</th></tr>
                            ) : reviews.map(review => (
                                <tr key={review.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-transparent/80 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                        <div className="font-bold text-slate-900 dark:text-gray-800 dark:text-white">{review.empName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 dark:text-slate-400 mt-0.5">{review.empCode}</div>
                                    </td>
                                    <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-600 fill-slate-50 dark:fill-slate-700'}`} 
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                        <p className="text-sm text-slate-700 dark:text-slate-600 dark:text-slate-300 truncate" title={review.comment}>
                                            {review.comment}
                                        </p>
                                    </td>
                                    <td className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                                            review.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                            review.status === 'Hidden' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-500 dark:text-slate-400' :
                                            'bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-amber-400'
                                        }`}>
                                            {review.status === 'Pending' && <Clock className="w-3 h-3" />}
                                            {review.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                                            {review.status === 'Hidden' && <EyeOff className="w-3 h-3" />}
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                        <div className="flex items-center justify-end gap-2">
                                            {review.status !== 'Approved' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(review.id, 'Approved')}
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#2563eb] hover:bg-blue-600 rounded-xl shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-[14px] h-[14px]" /> Approve
                                                </button>
                                            )}
                                            {review.status !== 'Hidden' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(review.id, 'Hidden')}
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-transparent0 hover:bg-slate-400 rounded-xl shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                                                    title="Hide"
                                                >
                                                    <EyeOff className="w-[14px] h-[14px]" /> Hide
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(review.id)}
                                                className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-[14px] h-[14px]" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && reviews.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 h-10 bg-transparent text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
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
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/30 backdrop-blur-sm overflow-y-auto">
            {Content}
        </div>
    );
};

export default ReviewAdminBoard;




