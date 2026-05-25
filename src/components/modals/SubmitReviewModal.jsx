import React, { useState } from 'react';
import { Star, X, Send, Loader2 } from 'lucide-react';
import { reviewService } from '../../services/review.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const SubmitReviewModal = ({ isOpen, onClose, currentUser }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAX_CHARS = 500;

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            showErrorToast('Please select a star rating.');
            return;
        }
        if (!comment.trim()) {
            showErrorToast('Please enter a comment.');
            return;
        }
        setIsSubmitting(true);
        try {
            await reviewService.submitReview({
                empCode: currentUser?.empCode || currentUser?.emp_Code || currentUser?.EmpCode || 'Unknown',
                empName: currentUser?.empName || currentUser?.emp_Name || currentUser?.EmpName || 'Unknown User',
                rating,
                comment
            });
            showSuccessToast('Thank you for your feedback!');
            setRating(0);
            setComment('');
            onClose();
        } catch (error) {
            showErrorToast('Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const evaluations = [
        { label: 'User Interface', pct: 85, color: 'bg-blue-500', text: 'text-blue-600', avg: 'Great' },
        { label: 'Performance', pct: 92, color: 'bg-emerald-500', text: 'text-emerald-600', avg: 'Great' },
        { label: 'Features', pct: 74, color: 'bg-violet-500', text: 'text-violet-600', avg: 'Good' },
        { label: 'Support', pct: 62, color: 'bg-orange-500', text: 'text-orange-600', avg: 'So-so' },
        { label: 'Mobile Access', pct: 35, color: 'bg-red-500', text: 'text-red-600', avg: 'Worst' }
    ];

    return (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-6 bg-slate-900/50">
            <div className="animate-in fade-in slide-in-from-top-8 duration-500 w-full max-w-5xl ">
                <div className="bg-slate-50/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/60 p-6 relative">
                    {/* Close */}
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 shadow-sm transition-all z-10">
                        <X size={15} />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[520px]">
                        {/* LEFT */}
                        <div className="flex flex-col gap-5">
                            {/* Overall Rating Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-5xl font-bold text-slate-800 tracking-tight">3.75</div>
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={16} className={s <= 3 ? 'fill-yellow-400 text-yellow-400' : s === 4 ? 'fill-yellow-400 text-yellow-400 opacity-50' : 'text-slate-200 fill-slate-50'} />
                                            ))}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5 font-medium">(1,297 Reviews)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Breakdown */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                                <h3 className="text-sm font-bold text-slate-700 mb-4">Rating Breakdown</h3>
                                <div className="space-y-2.5">
                                    {[
                                        { stars: 5, pct: 58, count: 752 },
                                        { stars: 4, pct: 22, count: 285 },
                                        { stars: 3, pct: 12, count: 156 },
                                        { stars: 2, pct: 5, count: 65 },
                                        { stars: 1, pct: 3, count: 39 },
                                    ].map((row) => (
                                        <div key={row.stars} className="flex items-center gap-2.5">
                                            <span className="text-xs font-semibold text-slate-600 w-4 text-right">{row.stars}</span>
                                            <Star size={12} className="fill-yellow-400 text-yellow-400 shrink-0" />
                                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${row.pct}%` }} />
                                            </div>
                                            <span className="text-[11px] font-medium text-slate-400 w-10 text-right">{row.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Element of Evaluation */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                                <h3 className="text-sm font-bold text-slate-700 mb-5">Element of Evaluation</h3>
                                <div className="space-y-4">
                                    {evaluations.map((ev, idx) => (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-semibold text-slate-600">{ev.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-800">{ev.pct}%</span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${ev.text}`}>{ev.avg}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${ev.color} transition-all duration-1000`} style={{ width: `${ev.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Submit Review Form */}
                        <div className="flex flex-col">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex-1 flex flex-col">
                                <h3 className="text-base font-bold text-slate-700 mb-4">Write a Review</h3>
                                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                                    <div className="flex flex-col items-center gap-5 py-3">
                                        <div className="flex flex-row items-center justify-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
                                                    <Star size={32} className={`${star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-200 fill-slate-50'} transition-all`} />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-500">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] || 'Select your rating'}</span>
                                    </div>
                                    <div className="relative flex-1 flex flex-col">
                                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us what you like or what could be improved..." maxLength={MAX_CHARS} className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm text-slate-700 placeholder:text-slate-400 min-h-[300px]" />
                                        <div className="flex items-center justify-end mt-1.5">
                                            <span className={`text-[11px] font-medium ${comment.length >= MAX_CHARS ? 'text-red-500' : comment.length > MAX_CHARS * 0.8 ? 'text-orange-500' : 'text-slate-400'}`}>
                                                {comment.length}/{MAX_CHARS}
                                            </span>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSubmitting || rating === 0 || !comment.trim()} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-blue-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0">
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Submit Review</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitReviewModal;
