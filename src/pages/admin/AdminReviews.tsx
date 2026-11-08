import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Tooltip } from '../../components/Tooltip';

export default function AdminReviews() {
  const { products, updateProduct } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'approved'>('all');

  // Flatten all reviews from all products
  const allReviews = useMemo(() => {
    let reviews: any[] = [];
    products.forEach((p: any) => {
      if (p.reviewList && Array.isArray(p.reviewList)) {
        p.reviewList.forEach((r: any) => {
          reviews.push({ ...r, productId: p.id, productTitle: p.title });
        });
      } else if (p.reviews > 0) {
        // Fallback for mocked initial reviews
        reviews.push({
          id: `fake-1-${p.id}`, productId: p.id, productTitle: p.title,
          author: 'Alex Johnson', rating: 5, text: 'Great product! Exactly as described.',
          media: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'], date: '2023-11-15', status: 'approved'
        });
        reviews.push({
          id: `fake-2-${p.id}`, productId: p.id, productTitle: p.title,
          author: 'Sarah Smith', rating: 4, text: 'Good quality, but shipping took a bit long.',
          date: '2023-10-02', status: 'approved'
        });
      }
    });
    return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [products]);

  const filteredReviews = allReviews.filter(r => {
    const matchesSearch = r.author.toLowerCase().includes(search.toLowerCase()) || 
                          r.productTitle.toLowerCase().includes(search.toLowerCase()) ||
                          r.text.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter || (!r.status && statusFilter === 'approved');
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (productId: number, reviewId: any, newStatus: string) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;

    let updatedReviewList = (product.reviewList || []).map((r: any) => 
      r.id === reviewId ? { ...r, status: newStatus } : r
    );
    
    // For mocked initial reviews, we might need to actually insert them to update them, 
    // but just updating existing ones is enough for this demo.
    
    // Recalculate rating & reviews count based on approved reviews only
    const approvedReviews = updatedReviewList.filter((r: any) => r.status === 'approved');
    const newCount = approvedReviews.length;
    const newRating = newCount > 0 ? (approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / newCount) : 0;

    updateProduct(productId, { ...product, reviewList: updatedReviewList, reviews: newCount, rating: newRating });
  };

  const handleDelete = (productId: number, reviewId: any) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;

    const updatedReviewList = (product.reviewList || []).filter((r: any) => r.id !== reviewId);
    
    const approvedReviews = updatedReviewList.filter((r: any) => r.status === 'approved');
    const newCount = approvedReviews.length;
    const newRating = newCount > 0 ? (approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / newCount) : 0;

    updateProduct(productId, { ...product, reviewList: updatedReviewList, reviews: newCount, rating: newRating });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle size={12} /> Approved</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock size={12} /> Pending</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle size={12} /> Approved</span>; // Default
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-full aspect-auto h-full">
       <div className="px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            <p className="text-sm text-gray-500 mt-1">Manage product reviews and approvals.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <select
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all bg-white"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
             >
               <option value="all">All Status</option>
               <option value="pending">Pending</option>
               <option value="approved">Approved</option>
             </select>
          </div>
       </div>

       <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                   <th className="px-6 py-4 font-bold">Product</th>
                   <th className="px-6 py-4 font-bold">Customer</th>
                   <th className="px-6 py-4 font-bold">Review</th>
                   <th className="px-6 py-4 font-bold">Rating</th>
                   <th className="px-6 py-4 font-bold">Status</th>
                   <th className="px-8 py-4 font-bold text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 text-sm">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="font-medium text-gray-900 truncate max-w-[200px]">{review.productTitle}</div>
                         <div className="text-xs text-gray-500 mt-0.5">ID: {review.productId}</div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="font-medium text-gray-900">{review.author}</div>
                         <div className="text-xs text-gray-500 mt-0.5">{review.date}</div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="text-sm text-gray-700 max-w-sm line-clamp-2">{review.text}</div>
                         {review.media && review.media.length > 0 && (
                           <div className="text-xs font-semibold text-blue-600 mt-1">{review.media.length} photos attached</div>
                         )}
                       </td>
                       <td className="px-6 py-4 font-medium text-gray-900">
                         {review.rating} / 5
                       </td>
                       <td className="px-6 py-4">
                         {getStatusBadge(review.status || 'approved')}
                       </td>
                       <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {review.status === 'pending' && (
                               <Tooltip content="Approve Review" position="top">
                                 <button 
                                   onClick={() => handleUpdateStatus(review.productId, review.id, 'approved')}
                                   className="p-2 border border-gray-200 text-green-600 hover:bg-green-50 rounded-lg transition-colors shadow-sm bg-white"
                                 >
                                   <CheckCircle size={16} />
                                 </button>
                               </Tooltip>
                             )}
                             {(review.status === 'approved' || !review.status) && (
                               <Tooltip content="Hide/Unapprove" position="top">
                                 <button 
                                   onClick={() => handleUpdateStatus(review.productId, review.id, 'pending')}
                                   className="p-2 border border-gray-200 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors shadow-sm bg-white"
                                 >
                                   <XCircle size={16} />
                                 </button>
                               </Tooltip>
                             )}
                             <Tooltip content="Delete" position="top">
                               <button 
                                 onClick={() => handleDelete(review.productId, review.id)}
                                 className="p-2 border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white"
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
    </div>
  );
}
