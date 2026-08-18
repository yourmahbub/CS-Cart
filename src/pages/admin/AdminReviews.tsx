import React, { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Trash2, Edit3, X, MessageSquare, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Tooltip } from '../../components/Tooltip';

export default function AdminReviews() {
  const { adminReviews, loadAdminReviews, updateReview, deleteReview } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => { loadAdminReviews().catch(() => {}); }, [loadAdminReviews]);

  const allReviews = useMemo(
    () => [...(adminReviews || [])].sort(
      (a, b) => new Date(b.dateISO || b.date).getTime() - new Date(a.dateISO || a.date).getTime(),
    ),
    [adminReviews],
  );

  const filtered = allReviews.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.author?.toLowerCase().includes(q) ||
      r.productTitle?.toLowerCase().includes(q) ||
      r.text?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' || r.status === statusFilter || (!r.status && statusFilter === 'approved');
    return matchesSearch && matchesStatus;
  });

  const pendingCount = allReviews.filter((r) => r.status === 'pending').length;

  const badge = (status: string) => {
    if (status === 'pending')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
          <Clock size={12} /> Pending
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <CheckCircle size={12} /> Approved
      </span>
    );
  };

  const saveEdit = async () => {
    const { productId, id, productTitle, ...data } = editing;
    try {
      await updateReview(id, data);
      setEditing(null);
    } catch (err) {
      alert(err && err.message ? err.message : 'Could not save the review.');
    }
  };

  const patch = (p: any) => setEditing((prev: any) => ({ ...prev, ...p }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
      <div className="px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">
            Approve, edit and reply to reviews.
            {pendingCount > 0 && <span className="text-yellow-700 font-medium"> {pendingCount} awaiting approval.</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews…"
              className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00a651]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00a651] bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Review</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.length > 0 ? (
              filtered.map((review) => (
                <tr key={`${review.productId}-${review.id}`} className="hover:bg-gray-50/50 group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-[190px]">{review.productTitle}</div>
                    <div className="text-xs text-gray-500 mt-0.5">ID: {review.productId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 flex items-center gap-1.5">
                      {review.flag} {review.author}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{review.date}</div>
                    {review.verified && <div className="text-[11px] text-blue-600 mt-0.5">Verified purchase</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-sm line-clamp-2">{review.text}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {review.media?.length > 0 && (
                        <span className="text-xs font-semibold text-blue-600">{review.media.length} photos</span>
                      )}
                      {review.adminReply && (
                        <span className="text-xs font-semibold text-green-600 inline-flex items-center gap-1">
                          <MessageSquare size={11} /> Replied
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Star size={13} className="fill-[#ff5c00] text-[#ff5c00]" />
                      {review.rating} / 5
                    </span>
                  </td>
                  <td className="px-6 py-4">{badge(review.status || 'approved')}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip content="Edit / reply" position="top">
                        <button
                          onClick={() => setEditing({ ...review })}
                          className="p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg bg-white"
                        >
                          <Edit3 size={16} />
                        </button>
                      </Tooltip>
                      {review.status === 'pending' ? (
                        <Tooltip content="Approve" position="top">
                          <button
                            onClick={() => updateReview(review.id, { status: 'approved' })}
                            className="p-2 border border-gray-200 text-green-600 hover:bg-green-50 rounded-lg bg-white"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Unpublish" position="top">
                          <button
                            onClick={() => updateReview(review.id, { status: 'pending' })}
                            className="p-2 border border-gray-200 text-yellow-600 hover:bg-yellow-50 rounded-lg bg-white"
                          >
                            <XCircle size={16} />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip content="Delete" position="top">
                        <button
                          onClick={() => {
                            if (confirm('Delete this review permanently?')) deleteReview(review.id);
                          }}
                          className="p-2 border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg bg-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Edit review</h3>
                <p className="text-[12px] text-gray-500">{editing.productTitle}</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Author</span>
                  <input value={editing.author || ''} onChange={(e) => patch({ author: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Date shown</span>
                  <input value={editing.date || ''} onChange={(e) => patch({ date: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Rating</span>
                  <select value={editing.rating} onChange={(e) => patch({ rating: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Status</span>
                  <select value={editing.status || 'approved'} onChange={(e) => patch({ status: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Usage duration</span>
                  <input value={editing.usageDuration || ''} placeholder="More than 1 month in use" onChange={(e) => patch({ usageDuration: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Country flag emoji</span>
                  <input value={editing.flag || ''} onChange={(e) => patch({ flag: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editing.verified} onChange={(e) => patch({ verified: e.target.checked })} className="w-4 h-4 accent-[#00a651]" />
                <span className="text-[13px] text-gray-700">Verified purchase</span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-gray-700">Review text</span>
                <textarea rows={4} value={editing.text || ''} onChange={(e) => patch({ text: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Advantages</span>
                  <textarea rows={2} value={editing.pros || ''} onChange={(e) => patch({ pros: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Disadvantages</span>
                  <textarea rows={2} value={editing.cons || ''} onChange={(e) => patch({ cons: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y" />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Helpful 👍</span>
                  <input type="number" value={editing.helpfulYes || 0} onChange={(e) => patch({ helpfulYes: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Not helpful 👎</span>
                  <input type="number" value={editing.helpfulNo || 0} onChange={(e) => patch({ helpfulNo: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Model reviewed</span>
                  <input value={editing.modelColor || ''} placeholder="Colour" onChange={(e) => patch({ modelColor: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
              </div>

              {editing.media?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-gray-700">Attached photos</span>
                  <div className="flex gap-2 flex-wrap">
                    {editing.media.map((url: string, i: number) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => patch({ media: editing.media.filter((_: any, x: number) => x !== i) })}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex flex-col gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <span className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Administrator reply
                </span>
                <textarea
                  rows={3}
                  value={editing.adminReply || ''}
                  placeholder="Publicly visible under the review…"
                  onChange={(e) => patch({ adminReply: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y bg-white"
                />
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEdit} className="px-4 py-2 text-sm font-medium text-white bg-[#00a651] rounded-lg hover:bg-[#008c44]">
                Save review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
