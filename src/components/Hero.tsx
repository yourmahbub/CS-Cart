import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useLang } from '../context/LanguageContext';

/** Past this many pixels a drag counts as a swipe rather than a click. */
const SWIPE_THRESHOLD = 50;
/** Movement below this is not yet committed to an axis. */
const AXIS_LOCK = 6;

export function Hero() {
  const { sliders } = useAdmin();
  const { isRTL } = useLang();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // In RTL a flex row starts at the right edge, so the track has to travel the
  // other way to bring the next slide into view.
  const sign = isRTL ? 1 : -1;

  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const axis = useRef<'undecided' | 'x' | 'y'>('undecided');
  const delta = useRef(0);
  /** Set once a drag has actually moved, so the release does not open a link. */
  const dragged = useRef(false);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
  );

  // Phones get their own artwork when the slide has one.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const count = sliders?.length ?? 0;

  const hasText = (slide: any) =>
    slide?.showContent !== false && !!(slide?.title || slide?.subtitle || slide?.buttonText);
  const textOnAnySlide = (sliders ?? []).some(hasText);

  /**
   * How the artwork should fill the frame.
   *
   * The shop's own choice always wins. Otherwise a very wide banner shown on a
   * phone falls back to being shown whole: cropping a 3:1 banner into a
   * phone-shaped box throws away most of its width, which reads as broken
   * rather than as a crop. Slides carrying text still fill the frame, because
   * the text needs something behind it edge to edge.
   */
  const fitFor = (slide: any) => {
    if (slide.fit === 'contain' || slide.fit === 'cover') return slide.fit;
    if (!isNarrow || hasText(slide) || slide.mobileImage) return 'cover';
    return (ratios[slide.id] ?? 0) > 2.2 ? 'contain' : 'cover';
  };

  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % count), [count]);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p === 0 ? count - 1 : p - 1)), [count]);

  useEffect(() => {
    if (isPaused || isDragging || count <= 1) return;
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [isPaused, isDragging, count]);

  // A slide removed in the admin must not leave the track parked past the end.
  useEffect(() => {
    setCurrentSlide((p) => (count === 0 ? 0 : Math.min(p, count - 1)));
  }, [count]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (count <= 1) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerId.current = e.pointerId;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = 'undecided';
    delta.current = 0;
    dragged.current = false;
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    // Decide once whether this gesture is a swipe or a page scroll. Until then
    // nothing moves, so a vertical flick never nudges the slider sideways.
    if (axis.current === 'undecided') {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis.current === 'x') {
        try { viewportRef.current?.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      }
    }
    if (axis.current !== 'x') return;

    dragged.current = true;
    // The decision always uses the real distance; only the rendered offset is
    // damped at the ends, where dragging on would otherwise reveal empty track.
    delta.current = dx;
    const advancing = sign * dx > 0;
    const atEdge = (advancing && currentSlide === count - 1) || (!advancing && currentSlide === 0);
    setDragX(atEdge ? dx / 3 : dx);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    const dx = delta.current;
    delta.current = 0;
    setDragX(0);
    setIsDragging(false);
    if (axis.current !== 'x') return;

    // `sign * dx` is positive whenever the drag was toward the next slide,
    // in either reading direction.
    if (sign * dx > SWIPE_THRESHOLD) nextSlide();
    else if (sign * dx < -SWIPE_THRESHOLD) prevSlide();
  };

  // A release that ends a drag must not also count as a click on the slide.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!dragged.current) return;
    e.preventDefault();
    e.stopPropagation();
    dragged.current = false;
  };

  if (!sliders || count === 0) return null;

  return (
    <div
      className="w-full relative bg-[#f5f5f5]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        // pan-y lets the browser keep vertical scrolling while we take the
        // horizontal axis; without it a swipe fights the page scroll.
        style={{ touchAction: 'pan-y' }}
        className={`w-full relative group overflow-hidden select-none ${
          // Slides carrying text need vertical room for it; an image-only
          // slider follows the artwork's own proportions on small screens.
          textOnAnySlide
            ? 'h-[300px] sm:h-[440px] lg:h-[520px] xl:h-[560px]'
            : 'aspect-[16/7] sm:aspect-auto sm:h-[440px] lg:h-[520px] xl:h-[560px]'
        } ${count > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      >

        {/* Slides Track */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(calc(${sign * currentSlide * 100}% + ${dragX}px))`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {sliders.map((slide: any) => {
            // An image-only slide gets no overlay and no text layer. The dark
            // wash exists purely to make text legible, so without text it is
            // just dimming the artwork.
            const showContent =
              slide.showContent !== false &&
              !!(slide.title || slide.subtitle || slide.buttonText);
            const overlay = showContent ? (slide.overlayOpacity ?? 50) / 100 : 0;
            const src =
              (isNarrow && slide.mobileImage) ||
              slide.image ||
              'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80';
            const fit = fitFor(slide);

            return (
            <div key={slide.id} className="w-full shrink-0 relative h-full">
              {/* A blurred copy fills the letterbox, so showing the whole
                  picture reads as deliberate instead of as empty margin. */}
              {fit === 'contain' && (
                <img
                  src={src}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60 pointer-events-none"
                />
              )}
              <img
                src={src}
                alt={slide.title || 'Slide Image'}
                // Native image dragging would hijack a mouse swipe.
                draggable={false}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (!img.naturalHeight) return;
                  const ratio = img.naturalWidth / img.naturalHeight;
                  setRatios((prev) => (prev[slide.id] === ratio ? prev : { ...prev, [slide.id]: ratio }));
                }}
                style={{
                  objectFit: fit,
                  objectPosition: `${slide.focalX ?? 50}% ${slide.focalY ?? 50}%`,
                }}
                className="relative w-full h-full pointer-events-none"
              />

              {/* Dark overlay — only when text sits on top of the image */}
              {overlay > 0 && (
                <div
                  className="absolute inset-0 bg-black transition-opacity duration-300"
                  style={{ opacity: overlay }}
                />
              )}

              {/* Hero Text Content */}
              {showContent && (
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full max-w-[1600px] mx-auto px-4 sm:px-8 flex flex-col ${
                   slide.align === 'center' ? 'items-center text-center' :
                   slide.align === 'right' ? 'items-end text-right' :
                   'items-start text-left'
                }`}>
                <div className={`max-w-xl flex flex-col ${
                   slide.align === 'center' ? 'items-center' :
                   slide.align === 'right' ? 'items-end' :
                   'items-start'
                }`}>
                  {slide.title && (
                    <h2 className="text-white text-4xl sm:text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
                      {slide.title.split('\n').map((line: string, i: number) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-gray-200 text-sm md:text-lg mb-8 drop-shadow-md line-clamp-3 md:line-clamp-none max-w-[500px] leading-relaxed">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.buttonText && (
                    <Link
                      to={slide.link || "/"}
                      draggable={false}
                      className="inline-flex items-center justify-center bg-[#00a651] hover:bg-[#008c44] text-white text-[13px] font-semibold px-8 py-3.5 rounded-full transition-all uppercase tracking-wide group/btn"
                    >
                      {slide.buttonText}
                      <ChevronRight className="w-4 h-4 ms-1 rtl:rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  </div>
                </div>
              </div>
              )}
            </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); isRTL ? nextSlide() : prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-[#00a651] backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label={isRTL ? 'Next slide' : 'Previous slide'}
            >
              <ChevronLeft className="w-6 h-6 ml-[-2px]" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); isRTL ? prevSlide() : nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-[#00a651] backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label={isRTL ? 'Previous slide' : 'Next slide'}
            >
              <ChevronRight className="w-6 h-6 mr-[-2px]" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {count > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {sliders.map((_: any, index: number) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === index
                    ? 'w-6 h-2.5 bg-[#00a651]'
                    : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
