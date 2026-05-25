import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Eye, EyeOff, CheckCircle, Clock, Loader2, X } from 'lucide-react';
import { reviewService } from '../../services/review.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const ReviewAdminBoard = ({ isOpen, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchReviews();
        }
    }, [isOpen]);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-blue-500" />
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">System Reviews</h2>
                            <p className="text-slate-500 text-xs">Manage feedback and ratings submitted by employees.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Stat Box */}
                        <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                <span className="text-2xl font-black text-slate-800">{averageRating}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
                                <p className="text-sm font-bold text-slate-800">{reviews.length} Reviews</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                                <th className="p-4 font-bold">Employee</th>
                                <th className="p-4 font-bold">Rating</th>
                                <th className="p-4 font-bold">Comment</th>
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                                        Loading reviews...
                                    </td>
                                </tr>
                            ) : reviews.map(review => (
                                <tr key={review.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{review.empName}</div>
                                        <div className="text-xs text-slate-500">{review.empCode}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-50'}`} 
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 max-w-md">
                                        <p className="text-slate-600 text-sm truncate" title={review.comment}>
                                            {review.comment}
                                        </p>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            review.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                            review.status === 'Hidden' ? 'bg-slate-100 text-slate-600' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {review.status === 'Pending' && <Clock className="w-3 h-3" />}
                                            {review.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                                            {review.status === 'Hidden' && <EyeOff className="w-3 h-3" />}
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {review.status !== 'Approved' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(review.id, 'Approved')}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {review.status !== 'Hidden' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(review.id, 'Hidden')}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Hide"
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
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
        </div>
    );
};

export default ReviewAdminBoard;
