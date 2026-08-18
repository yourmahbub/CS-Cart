import React, { useState, useEffect } from 'react';
import { PlayCircle, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface GalleryProps {
  product: any;
  media: MediaItem[];
  selected: MediaItem | undefined;
  onSelect: (m: MediaItem) => void;
  config: any;
}

export function ProductGallery({ product, media, selected, onSelect, config }: GalleryProps) {
  const [lightbox, setLightbox] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const current = selected || media[0];

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const step = (dir: number) => {
    if (media.length === 0) return;
    const idx = media.findIndex((m) => m.url === current?.url);
    const next = (idx + dir + media.length) % media.length;
    onSelect(media[next]);
  };

  const labels: { text: string; bg: string }[] = [];
  if (config.gallery.showDiscountBadge && product.discount) {
    labels.push({ text: `-${product.discount}%`, bg: config.theme.danger });
  }
  if (config.gallery.showLabels) {
    if (product.isNew) labels.push({ text: 'New', bg: '#00a651' });
    if (product.isBestseller) labels.push({ text: 'Bestseller', bg: '#0058a3' });
    if (product.isPopular) labels.push({ text: 'Most popular', bg: '#f0a500' });
  }

  if (!current) {
    return <div className="w-full aspect-square bg-gray-50 rounded-xl" />;
  }

  return (
    <div className="flex flex-col relative w-full">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 items-start">
        {labels.map((l, i) => (
          <span
            key={i}
            className="text-white text-[11px] font-bold px-2 py-[3px] rounded-[4px] shadow-sm select-none pointer-events-none"
            style={{ background: l.bg }}
          >
            {l.text}
          </span>
        ))}
      </div>

      <div
        className={`w-full flex items-center justify-center relative bg-white min-h-[320px] group ${
          config.gallery.enableLightbox ? 'cursor-zoom-in' : ''
        }`}
        onClick={() => config.gallery.enableLightbox && setLightbox(true)}
      >
        <AnimatePresence mode="wait">
          {current.type === 'video' && !videoFailed ? (
            <motion.video
              key={current.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              src={current.url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              poster={product.image || undefined}
              onError={() => setVideoFailed(true)}
              className="w-full max-h-[440px] object-contain"
            />
          ) : current.type === 'video' ? (
            // Video source unreachable — fall back to the product image
            <img
              key="video-fallback"
              src={product.image || undefined}
              alt={product.title}
              className="w-full max-h-[440px] object-contain mix-blend-multiply"
            />
          ) : (
            <motion.img
              key={current.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              src={current.url || undefined}
              alt={product.title}
              className="w-full max-h-[440px] object-contain mix-blend-multiply"
            />
          )}
        </AnimatePresence>
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 justify-center pt-4 flex-wrap">
          {media.slice(0, config.gallery.thumbCount || media.length).map((m, i) => (
            <button
              key={i}
              onClick={() => onSelect(m)}
              className={`w-[62px] h-[62px] flex-shrink-0 border rounded-[8px] p-1.5 transition-colors relative bg-white ${
                current.url === m.url ? 'border-gray-500' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {m.type === 'video' ? (
                <>
                  <video src={m.url} className="w-full h-full object-cover rounded-[6px]" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-white drop-shadow" />
                  </span>
                </>
              ) : (
                <img src={m.url || undefined} alt="" className="w-full h-full object-contain mix-blend-multiply" />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
            onClick={() => setLightbox(false)}
          >
            <div className="flex items-center justify-between p-5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white text-[15px] font-semibold truncate pr-4">{product.title}</h2>
              <button
                onClick={() => setLightbox(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative min-h-0 px-4" onClick={(e) => e.stopPropagation()}>
              {current.type === 'video' ? (
                <video src={current.url} controls autoPlay className="max-w-full max-h-full object-contain" />
              ) : (
                <img src={current.url} alt={product.title} className="max-w-full max-h-full object-contain" />
              )}

              {media.length > 1 && (
                <>
                  <button
                    onClick={() => step(-1)}
                    className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
                    aria-label="Previous"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                  <button
                    onClick={() => step(1)}
                    className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="shrink-0 flex justify-center gap-2 p-5 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                {media.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => onSelect(m)}
                    className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border transition-all ${
                      current.url === m.url ? 'border-white opacity-100' : 'border-white/20 opacity-50 hover:opacity-90'
                    }`}
                  >
                    {m.type === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
