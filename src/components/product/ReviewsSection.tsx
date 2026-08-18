import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, Share2, ExternalLink, ChevronDown, ChevronRight,
  CheckCircle2, Info, X, ImagePlus, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Stars } from './Stars';

interface Props {
  product: any;
  config: any;
  onAddReview: (review: any) => void;
  onVote: (reviewId: number, dir: 'up' | 'down') => void;
}

const CLAMP = 320;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function parseDate(r: any): Date {
  if (r.dateISO) return new Date(r.dateISO);
  const parsed = Date.parse(r.date);
  return isNaN(parsed) ? new Date(0) : new Date(parsed);
}

/** One review row — used both in the list and (compact) in the most-helpful cards. */
function ReviewBody({ review, config, compact = false, onVote }: any) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const long = (review.text || '').length > CLAMP;
  const text = long && !expanded ? review.text.slice(0, CLAMP).trimEnd() + '…' : review.text;

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {review.flag && <span className="text-[13px]">{review.flag}</span>}
          <span className="font-bold text-[13px] text-gray-900">{review.author}</span>
          {config.showVerifiedBadge && review.verified && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <CheckCircle2 className="w-[13px] h-[13px] text-[#0058a3]" />
              {config.verifiedLabel}
            </span>
          )}
        </div>
        {config.showUsageDuration && review.usageDuration && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
            {review.usageDuration}
            <Info className="w-[13px] h-[13px]" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 mb-2">
        <Stars value={review.rating} size={13} />
        <span className="text-[11px] text-gray-400 shrink-0">{review.date}</span>
      </div>

      {config.showModelLine && (review.modelColor || review.modelName) && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2 text-[11px]">
          <span className="text-gray-400">Model review:</span>
          {review.modelColor && (
            <span className="px-1.5 py-[2px] rounded bg-gray-100 text-gray-600">{review.modelColor}</span>
          )}
          {review.modelSize && (
            <span className="px-1.5 py-[2px] rounded bg-gray-100 text-gray-600">{review.modelSize}</span>
          )}
          {review.modelName && (
            <Link
              to={review.modelLink || '#'}
              className="text-[#0058a3] hover:underline inline-flex items-center gap-1 max-w-full"
            >
              <span className="truncate">{review.modelName}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </Link>
          )}
        </div>
      )}

      <p className="text-[12.5px] text-gray-700 leading-[1.7] whitespace-pre-line">{text}</p>
      {long && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[12px] text-[#0058a3] hover:underline inline-flex items-center gap-1 mt-1"
        >
          {expanded ? 'Show less' : 'Show more'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}

      {config.showProsCons && (review.pros || review.cons) && (
        <div className="mt-3 flex flex-col gap-2">
          {review.pros && (
            <div>
              <div className="text-[12px] font-bold text-gray-900">{config.prosLabel}</div>
              <div className="text-[12.5px] text-gray-700 leading-relaxed">{review.pros}</div>
            </div>
          )}
          {review.cons && (
            <div>
              <div className="text-[12px] font-bold text-gray-900">{config.consLabel}</div>
              <div className="text-[12.5px] text-gray-700 leading-relaxed">{review.cons}</div>
            </div>
          )}
        </div>
      )}

      {!compact && review.media?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {review.media.map((url: string, i: number) => (
            <button
              key={i}
              onClick={() => setLightbox(url)}
              className="w-[52px] h-[52px] rounded-[6px] border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mt-3">
        {config.showHelpfulVotes && (
          <div className="flex items-center gap-3 text-[12px] text-gray-500">
            {compact ? (
              <span className="inline-flex items-center gap-1.5">
                <ThumbsUp className="w-[14px] h-[14px]" />
                {review.helpfulYes || 0} found this helpful
              </span>
            ) : (
              <>
                <span className="text-gray-500">{config.helpfulLabel}</span>
                <button
                  onClick={() => onVote?.(review.id, 'up')}
                  className="inline-flex items-center gap-1 hover:text-[#00a651] transition-colors"
                >
                  <ThumbsUp className="w-[14px] h-[14px]" />
                  {review.helpfulYes || 0}
                </button>
                <button
                  onClick={() => onVote?.(review.id, 'down')}
                  className="inline-flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <ThumbsDown className="w-[14px] h-[14px]" />
                  {review.helpfulNo || 0}
                </button>
              </>
            )}
          </div>
        )}
        {config.showShare && (
          <button className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-700 transition-colors">
            <Share2 className="w-[14px] h-[14px]" />
            Share
          </button>
        )}
      </div>

      {config.showAdminReplies && review.adminReply && (
        <div className="mt-4 bg-[#f5f7fa] rounded-[10px] p-4">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 mb-1.5">
            <Info className="w-[14px] h-[14px]" />
            {config.adminReplyLabel}
          </div>
          <p className="text-[12.5px] text-gray-700 leading-relaxed">{review.adminReply}</p>
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6"
          >
            <button className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
            <img src={lightbox} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ReviewsSection({ product, config, onAddReview, onVote }: Props) {
  const all: any[] = useMemo(
    () => (product.reviewList || []).filter((r: any) => r.status === 'approved' || !r.status),
    [product.reviewList],
  );

  const [period, setPeriod] = useState(config.periodTabs?.[0] || 'Overall');
  const [sort, setSort] = useState(config.sortOptions?.[0] || 'Newest Items First');
  const [ratingFilter, setRatingFilter] = useState(config.ratingFilterOptions?.[0] || 'All ratings');
  const [onlyBuyers, setOnlyBuyers] = useState(false);
  const [withPhoto, setWithPhoto] = useState(false);
  const [visible, setVisible] = useState(config.perPage || 5);
  const [modalOpen, setModalOpen] = useState(false);
  const [photoLightbox, setPhotoLightbox] = useState<string | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [form, setForm] = useState({ rating: 5, author: '', text: '', pros: '', cons: '', media: [] as string[] });
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);

  const filtered = useMemo(() => {
    let list = [...all];

    if (period !== 'Overall') {
      const cutoff =
        period === 'Last 30 days' ? daysAgo(30) : period === 'Last 60 days' ? daysAgo(60) : daysAgo(365);
      list = list.filter((r) => parseDate(r) >= cutoff);
    }
    if (ratingFilter !== 'All ratings') {
      const n = parseInt(ratingFilter, 10);
      if (!isNaN(n)) list = list.filter((r) => Math.round(r.rating) === n);
    }
    if (onlyBuyers) list = list.filter((r) => r.verified || r.onlyBuyer);
    if (withPhoto) list = list.filter((r) => r.media?.length > 0);

    switch (sort) {
      case 'Oldest Items First': list.sort((a, b) => +parseDate(a) - +parseDate(b)); break;
      case 'Highest Rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'Lowest Rating': list.sort((a, b) => a.rating - b.rating); break;
      case 'Most Helpful': list.sort((a, b) => (b.helpfulYes || 0) - (a.helpfulYes || 0)); break;
      default: list.sort((a, b) => +parseDate(b) - +parseDate(a));
    }
    return list;
  }, [all, period, ratingFilter, onlyBuyers, withPhoto, sort]);

  const photos = useMemo(() => all.flatMap((r) => r.media || []), [all]);

  const mostPositive = useMemo(
    () =>
      all.find((r) => r.highlightPositive) ||
      [...all].filter((r) => r.rating >= 4).sort((a, b) => (b.helpfulYes || 0) - (a.helpfulYes || 0))[0],
    [all],
  );
  const mostCritical = useMemo(
    () =>
      all.find((r) => r.highlightCritical) ||
      [...all].filter((r) => r.rating <= 3).sort((a, b) => (b.helpfulYes || 0) - (a.helpfulYes || 0))[0],
    [all],
  );

  const breakdown = useMemo(() => {
    // 1. An explicit breakdown set in the admin always wins.
    if (product.ratingBreakdown) return product.ratingBreakdown;

    // 2. Otherwise derive it from the reviews we actually hold.
    if (all.length > 0) {
      const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      all.forEach((r) => { counts[Math.round(r.rating)] = (counts[Math.round(r.rating)] || 0) + 1; });
      return Object.fromEntries(
        Object.entries(counts).map(([k, v]) => [k, Math.round((v / all.length) * 100)]),
      );
    }

    // 3. No stored reviews but an aggregate score exists (imported ratings):
    //    approximate the distribution so the bars aren't misleadingly all-zero.
    const r = product.rating || 0;
    const empty: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (r <= 0) return empty;
    const lo = Math.max(1, Math.floor(r));
    const hi = Math.min(5, Math.ceil(r));
    const frac = Math.round((r - lo) * 100);
    if (lo === hi) empty[lo] = 100;
    else { empty[hi] = frac; empty[lo] = 100 - frac; }
    return empty;
  }, [all, product.ratingBreakdown, product.rating]);

  const reviewCount = product.reviews ?? all.length;
  const rating = product.rating || 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setForm((p) => ({ ...p, media: [...p.media, ev.target!.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      // The server decides verification and approval — these are only hints.
      await onAddReview({
        author: form.author,
        rating: form.rating,
        text: form.text,
        pros: form.pros,
        cons: form.cons,
        media: form.media,
      });
      setModalOpen(false);
      setForm({ rating: 5, author: '', text: '', pros: '', cons: '', media: [] });
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Your review could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = filtered.length - visible;
  const nextChunk = Math.min(config.perPage || 5, remaining);

  return (
    <div className="w-full mb-14">
      <h2 className="text-[26px] font-bold text-gray-900 mb-5">{config.title}</h2>

      {/* Summary + breakdown + write-a-review */}
      {config.showSummary && (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start mb-6">
          <div className="flex items-start gap-5">
            <div className="flex flex-col">
              <span className="text-[38px] font-bold text-gray-900 leading-none mb-1">{rating.toFixed(1)}</span>
              <Stars value={rating} size={13} />
              <span className="text-[11px] text-gray-500 mt-1">Reviews: {reviewCount}</span>
            </div>

            {config.showBreakdown && (
              <div className="flex flex-col gap-[5px] pt-1 min-w-[210px]">
                {[5, 4, 3, 2, 1].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 w-[42px] shrink-0">{s} stars</span>
                    <div className="h-[6px] bg-gray-100 rounded-full flex-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${breakdown[s] || 0}%`, background: '#ff5c00' }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 w-[32px] text-right shrink-0">{breakdown[s] || 0}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {config.showWriteReview && (
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold text-gray-900 mb-0.5">{config.writeReviewTitle}</h3>
              <p className="text-[12px] text-gray-500 mb-2.5">{config.writeReviewSubtitle}</p>
              <button
                onClick={() => setModalOpen(true)}
                className="border-2 rounded-full px-5 py-1.5 text-[13px] font-bold w-fit transition-colors hover:bg-orange-50"
                style={{ borderColor: '#ff5c00', color: '#ff5c00' }}
              >
                {config.writeReviewLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Period tabs — pointless with nothing to filter */}
      {config.showPeriodTabs && all.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {config.periodTabs.map((p: string) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setVisible(config.perPage || 5); }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                period === p
                  ? 'border-gray-900 text-gray-900 bg-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Customer photos */}
      {config.showCustomerPhotos && photos.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-2.5">
            <h3 className="text-[13px] font-bold text-gray-900">{config.customerPhotosTitle}</h3>
            <button
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="text-[12px] text-[#0058a3] hover:underline inline-flex items-center gap-0.5"
            >
              {showAllPhotos ? 'Show less' : config.allPhotosLabel}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={showAllPhotos ? 'flex flex-wrap gap-2' : 'flex gap-2 overflow-x-auto pb-2 relative'}>
            {(showAllPhotos ? photos : photos.slice(0, 12)).map((url, i) => (
              <button
                key={i}
                onClick={() => setPhotoLightbox(url)}
                className="w-[74px] h-[74px] shrink-0 rounded-[8px] overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {!showAllPhotos && photos.length > 12 && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="w-[74px] h-[74px] shrink-0 rounded-[8px] border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Most helpful positive / critical */}
      {config.showMostHelpful && (mostPositive || mostCritical) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
          {mostPositive && (
            <div>
              <h4 className="text-[12px] font-bold text-gray-900 mb-2">{config.positiveTitle}</h4>
              <div className="bg-[#f0f9f2] border border-[#d9eede] rounded-[10px] p-4">
                <ReviewBody review={mostPositive} config={config} compact onVote={onVote} />
              </div>
            </div>
          )}
          {mostCritical && (
            <div>
              <h4 className="text-[12px] font-bold text-gray-900 mb-2">{config.criticalTitle}</h4>
              <div className="bg-[#fdf1f4] border border-[#f6dde3] rounded-[10px] p-4">
                <ReviewBody review={mostCritical} config={config} compact onVote={onVote} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sort / filter bar */}
      {config.showSortBar && all.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap border border-gray-200 rounded-[10px] px-4 py-2.5 mb-6">
          <label className="flex items-center gap-1.5 text-[12px] text-gray-500">
            Sort by:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[12px] font-medium text-gray-900 bg-transparent border-0 outline-none cursor-pointer pr-1"
            >
              {config.sortOptions.map((o: string) => <option key={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-[12px] text-gray-500">
            Rating:
            <select
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setVisible(config.perPage || 5); }}
              className="text-[12px] font-medium text-gray-900 bg-transparent border-0 outline-none cursor-pointer pr-1"
            >
              {config.ratingFilterOptions.map((o: string) => <option key={o}>{o}</option>)}
            </select>
          </label>

          {config.showOnlyBuyersFilter && (
            <label className="flex items-center gap-1.5 text-[12px] text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyBuyers}
                onChange={(e) => { setOnlyBuyers(e.target.checked); setVisible(config.perPage || 5); }}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#ff5c00]"
              />
              Only buyers
            </label>
          )}
          {config.showWithPhotoFilter && (
            <label className="flex items-center gap-1.5 text-[12px] text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={withPhoto}
                onChange={(e) => { setWithPhoto(e.target.checked); setVisible(config.perPage || 5); }}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#ff5c00]"
              />
              With photo
            </label>
          )}

          <span className="text-[12px] text-gray-500 ml-auto">
            {(config.countLabel || 'We found {n} reviews').replace('{n}', String(filtered.length))}
          </span>
        </div>
      )}

      {/* Review list */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-[13px] py-6">
          {all.length === 0
            ? 'There are no published reviews for this product yet. Be the first to write one.'
            : 'No reviews match the selected filters.'}
        </p>
      ) : (
        <div className="flex flex-col">
          {filtered.slice(0, visible).map((r) => (
            <div key={r.id} className="border-b border-gray-100 py-5 first:pt-0">
              <ReviewBody review={r} config={config} onVote={onVote} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col items-center gap-3 mt-6">
          <span className="text-[12px] text-gray-500">
            Showing {Math.min(visible, filtered.length)} of {filtered.length} reviews
          </span>
          {remaining > 0 && (
            <button
              onClick={() => setVisible(visible + (config.perPage || 5))}
              className="border-2 rounded-full px-6 py-2 text-[13px] font-bold transition-colors hover:bg-orange-50"
              style={{ borderColor: '#ff5c00', color: '#ff5c00' }}
            >
              {(config.showMoreLabel || 'Show {n} more reviews').replace('{n}', String(nextChunk))}
            </button>
          )}
        </div>
      )}

      {/* Photo lightbox for the customer-photos strip */}
      <AnimatePresence>
        {photoLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhotoLightbox(null)}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6"
          >
            <button className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
            <img src={photoLightbox} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write review modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="bg-white rounded-[16px] p-6 sm:p-8 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-5">{config.writeReviewLabel}</h3>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-[13px] mb-4">
                  {submitError}
                </div>
              )}

              {config.requirePurchase && (
                <label className="flex items-start gap-3 cursor-pointer mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <input
                    type="checkbox"
                    checked={purchaseConfirmed}
                    onChange={(e) => setPurchaseConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#0058a3]"
                  />
                  <span className="text-[12.5px] text-blue-900">
                    <span className="font-semibold block">I purchased this product</span>
                    Reviews are limited to verified buyers with a completed order.
                  </span>
                </label>
              )}

              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-900 mb-1.5">Rating</label>
                  <Stars value={form.rating} size={30} onSelect={(v) => setForm({ ...form, rating: v })} />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-900 mb-1.5">Your name</label>
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full border border-gray-300 rounded-[10px] px-4 py-2.5 text-sm outline-none focus:border-[#ff5c00]"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-900 mb-1.5">Your review</label>
                  <textarea
                    required
                    rows={4}
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    className="w-full border border-gray-300 rounded-[10px] px-4 py-2.5 text-sm outline-none focus:border-[#ff5c00] resize-none"
                    placeholder="What did you like or dislike?"
                  />
                </div>

                {config.showProsCons && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-1.5">{config.prosLabel}</label>
                      <textarea
                        rows={2}
                        value={form.pros}
                        onChange={(e) => setForm({ ...form, pros: e.target.value })}
                        className="w-full border border-gray-300 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-[#ff5c00] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-1.5">{config.consLabel}</label>
                      <textarea
                        rows={2}
                        value={form.cons}
                        onChange={(e) => setForm({ ...form, cons: e.target.value })}
                        className="w-full border border-gray-300 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-[#ff5c00] resize-none"
                      />
                    </div>
                  </div>
                )}

                {config.allowPhotoUpload && (
                  <div>
                    <label className="block text-[13px] font-bold text-gray-900 mb-1.5">Attach photos (optional)</label>
                    {form.media.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-2">
                        {form.media.map((url, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, media: p.media.filter((_, x) => x !== i) }))}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label
                      htmlFor="review-photo-upload"
                      className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-[10px] hover:border-[#ff5c00] cursor-pointer transition-colors group"
                    >
                      <input id="review-photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      <ImagePlus className="w-5 h-5 text-gray-400 group-hover:text-[#ff5c00] mb-1" />
                      <span className="text-[12px] text-gray-500 group-hover:text-[#ff5c00]">Click to upload</span>
                    </label>
                  </div>
                )}

                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-[13px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 text-white rounded-full font-bold text-[13px] transition-colors disabled:opacity-60"
                    style={{ background: '#ff5c00' }}
                  >
                    {submitting ? 'Submitting…' : 'Submit review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
