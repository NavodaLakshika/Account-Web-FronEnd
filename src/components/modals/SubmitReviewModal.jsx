import React, { useState, useEffect } from 'react';
import { Star, X, Send, Loader2 } from 'lucide-react';
import { reviewService } from '../../services/review.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const SubmitReviewModal = ({ isOpen, onClose, currentUser }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [stats, setStats] = useState({
        total: 0,
        average: 0,
        distribution: [
            { stars: 5, pct: 0, count: 0 },
            { stars: 4, pct: 0, count: 0 },
            { stars: 3, pct: 0, count: 0 },
            { stars: 2, pct: 0, count: 0 },
            { stars: 1, pct: 0, count: 0 },
        ]
    });

    const MAX_CHARS = 500;

    useEffect(() => {
        if (isOpen) {
            fetchStats();
        }
    }, [isOpen]);

    const fetchStats = async () => {
        try {
            const allReviews = await reviewService.getAllReviews();
            if (allReviews && allReviews.length > 0) {
                const total = allReviews.length;
                let sum = 0;
                const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                allReviews.forEach(r => {
                    const rRating = Math.floor(r.rating || 0);
                    if (rRating >= 1 && rRating <= 5) {
                        counts[rRating]++;
                        sum += rRating;
                    }
                });
                
                const average = (sum / total).toFixed(1);
                const distribution = [5, 4, 3, 2, 1].map(stars => ({
                    stars,
                    count: counts[stars],
                    pct: Math.round((counts[stars] / total) * 100)
                }));
                
                setStats({ total, average, distribution });
            }
        } catch (error) {
            console.error('Failed to fetch reviews for stats', error);
        }
    };

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
            fetchStats(); // Update stats
            onClose();
        } catch (error) {
            showErrorToast('Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-sm font-sans">
            <div className="relative w-full max-w-[1000px] bg-white shadow-2xl flex flex-col rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header with Close */}
                <div className="flex justify-end p-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
                        <X size={28} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="px-8 md:px-12 pb-12 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[420px]">
                        {/* LEFT */}
                        <div className="bg-white rounded-sm shadow-sm p-6 flex flex-col flex-1">
                            {/* Overall Rating Section */}
                            <div className="flex flex-col flex-1 relative mb-6">
                                
                                <div className="flex items-center justify-center gap-6 my-auto pt-4 pb-2">
                                    <div className="text-6xl font-bold text-slate-800 tracking-tight">{stats.average || "0.0"}</div>
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={20} className={s <= Math.round(stats.average) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-50'} />
                                            ))}
                                        </div>
                                        <div className="text-sm text-slate-400 font-medium">({stats.total} {stats.total === 1 ? 'Review' : 'Reviews'})</div>
                                    </div>
                                </div>

                                <div className="text-center w-full mt-2">
                                    <p className="text-[11.5px] text-slate-500 font-medium px-2">
                                        Your honest feedback helps us improve our platform for everyone.
                                    </p>
                                </div>
                            </div>

                            <hr className="border-slate-100 mb-6" />

                            {/* Rating Breakdown */}
                            <div className="flex flex-col justify-center mb-6">
                                <h3 className="text-sm font-bold text-slate-700 mb-5">Rating Breakdown</h3>
                                <div className="space-y-3">
                                    {stats.distribution.map((row) => (
                                        <div key={row.stars} className="flex items-center gap-3">
                                            <span className="text-xs font-semibold text-slate-600 w-4 text-right">{row.stars}</span>
                                            <Star size={14} className="fill-yellow-400 text-yellow-400 shrink-0" />
                                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-yellow-400 transition-all duration-700" style={{ width: `${row.pct}%` }} />
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 w-10 text-right">{row.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Badge / Community Stats */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 flex flex-col justify-center mt-auto">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-600 p-2 rounded-full text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm">Trusted by Professionals</h4>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Join thousands of businesses who use our platform daily. Your feedback directly shapes the future of our modules and helps us build the perfect tools for your success.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT — Submit Review Form */}
                        <div className="flex flex-col">
 <div className="bg-white rounded-sm shadow-sm p-6 flex-1 flex flex-col">
                                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                                    <div className="flex flex-col items-center gap-5 py-3">
                                        <div className="flex flex-row items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const isSelected = star <= rating;
                                                const isHovered = hoveredRating > 0;
                                                
                                                let starClass = "";
                                                if (isHovered) {
                                                    if (star <= hoveredRating) {
                                                        if (star <= rating) {
                                                            starClass = "fill-yellow-400 text-yellow-400 drop-shadow-[0_0px_8px_rgba(250,204,21,0.5)] scale-110";
                                                        } else {
                                                            starClass = "fill-transparent text-yellow-400 drop-shadow-[0_0px_4px_rgba(250,204,21,0.3)] scale-105";
                                                        }
                                                    } else {
                                                        if (star <= rating) {
                                                            starClass = "fill-transparent text-yellow-400 opacity-60 scale-95";
                                                        } else {
                                                            starClass = "fill-transparent text-slate-300 scale-100";
                                                        }
                                                    }
                                                } else {
                                                    if (isSelected) {
                                                        starClass = "fill-yellow-400 text-yellow-400 drop-shadow-[0_0px_8px_rgba(250,204,21,0.5)] scale-110";
                                                    } else {
                                                        starClass = "fill-transparent text-slate-300 scale-100";
                                                    }
                                                }

                                                return (
                                                    <button 
                                                        key={star} 
                                                        type="button" 
                                                        onMouseEnter={() => setHoveredRating(star)} 
                                                        onMouseLeave={() => setHoveredRating(0)} 
                                                        onClick={() => setRating(star)} 
                                                        className="focus:outline-none p-1 relative transition-transform active:scale-90 duration-150 group"
                                                    >
                                                        <Star 
                                                            size={36} 
                                                            className={`transition-all duration-300 ${starClass} stroke-[1.8px]`} 
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-500 mt-1">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] || 'Select your rating'}</span>
                                    </div>
                                    <div className="relative flex-1 flex flex-col">
                                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us what you like or what could be improved..." maxLength={MAX_CHARS} className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm text-slate-700 placeholder:text-slate-400 min-h-[160px]" />
                                        <div className="flex items-center justify-end mt-1.5">
                                            <span className={`text-[11px] font-medium ${comment.length >= MAX_CHARS ? 'text-red-500' : comment.length > MAX_CHARS * 0.8 ? 'text-orange-500' : 'text-slate-400'}`}>
                                                {comment.length}/{MAX_CHARS}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Review Guidelines */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex gap-3 items-start mt-1 mb-1">
                                        <div className="text-blue-500 mt-0.5 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-slate-700 mb-1">Review Guidelines</h4>
                                            <ul className="text-[11.5px] text-slate-500 list-disc pl-3.5 space-y-1 font-medium">
                                                <li>Share specific features you love or want improved.</li>
                                                <li>Keep it constructive, respectful, and professional.</li>
                                                <li>Please do not include personal or sensitive data.</li>
                                            </ul>
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
