import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';

const UserFeedbackView = ({ feedbackData, feedbackLoading, handleDeleteFeedback, setFullScreenImage }) => {
    return (
        <div className="bg-white border border-gray-200 flex flex-col gap-6 pb-6 rounded-[3px] overflow-hidden mb-6 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-6 pl-6 pt-6 pr-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[3px] bg-blue-50 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-800">User Feedback</h3>
                        <p className="text-[11px] text-gray-500 font-medium">View and manage feedback submitted from Report Builder</p>
                    </div>
                </div>
                <span className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-[3px]">{feedbackData.length} Records</span>
            </div>

            <div className="border border-gray-200 overflow-hidden mx-6 bg-white rounded-[3px] shadow-sm flex-1 flex flex-col mb-4">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-3 pt-3 pl-3 text-[12px] font-bold text-gray-800 whitespace-nowrap">Date</th>
                                <th className="pb-3 pt-3 text-[12px] font-bold text-gray-800 whitespace-nowrap">Employee Name</th>
                                <th className="pb-3 pt-3 text-[12px] font-bold text-gray-800 whitespace-nowrap">Company</th>
                                <th className="pb-3 pt-3 text-[12px] font-bold text-gray-800 whitespace-nowrap">Report Name</th>
                                <th className="pb-3 pt-3 text-[12px] font-bold text-gray-800 whitespace-nowrap">Feedback</th>
                                <th className="pb-3 pt-3 text-[12px] font-bold text-gray-800 whitespace-nowrap">Images</th>
                                <th className="pb-3 pt-3 pr-3 text-[12px] font-bold text-gray-800 whitespace-nowrap text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {feedbackLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500 text-[13px] font-medium">Loading feedback...</td>
                                </tr>
                            ) : feedbackData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500 text-[13px] font-medium">No feedback records found.</td>
                                </tr>
                            ) : (
                                feedbackData.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all group">
                                        <td className="py-4 px-3 text-[12px] text-gray-500 whitespace-nowrap group-hover:text-blue-600 transition-colors">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-4 pl-0 text-[13px] text-slate-700 font-bold uppercase group-hover:text-blue-600 transition-colors">
                                            {item.employeeName || '-'}
                                        </td>
                                        <td className="py-4 text-[12px] text-blue-600 font-mono font-bold">
                                            {item.companyId || '-'}
                                        </td>
                                        <td className="py-4 text-[12px] font-medium text-gray-600">
                                            {item.reportName || '-'}
                                        </td>
                                        <td className="py-4 text-[12px] text-gray-500 max-w-[250px] truncate" title={item.feedbackText}>
                                            {item.feedbackText}
                                        </td>
                                        <td className="py-4">
                                            {(() => {
                                                try {
                                                    if (!item.images || item.images === '[]') return <span className="text-[12px] text-gray-500">-</span>;
                                                    const imgs = JSON.parse(item.images);
                                                    if (!Array.isArray(imgs) || imgs.length === 0) return <span className="text-[12px] text-gray-500">-</span>;
                                                    return (
                                                        <div className="flex gap-1.5 overflow-x-auto max-w-[120px] pb-1">
                                                            {imgs.map((img, i) => (
                                                                <div key={i} onClick={() => setFullScreenImage(img)} className="shrink-0 block cursor-pointer" title="Click to view full image">
                                                                    <img src={img} alt={`Attachment ${i + 1}`} className="w-8 h-8 object-cover rounded shadow-sm border border-gray-200 hover:opacity-80 transition-opacity" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                } catch (e) {
                                                    return <span className="text-[12px] text-gray-500">Error</span>;
                                                }
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 pr-2 text-right">
                                            <div className="flex justify-end">
                                                <button
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                                                    onClick={() => handleDeleteFeedback(item.id)}
                                                    title="Delete Feedback"
                                                >
                                                    <Trash2 size={10} /> Delete
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
        </div>
    );
};

export default UserFeedbackView;
