import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

export function Hero() {
  const { sliders } = useAdmin();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || sliders.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, sliders.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliders.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));

  if (!sliders || sliders.length === 0) return null;

  return (
    <div 
      className="w-full relative bg-[#f5f5f5]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1440px] mx-auto relative group overflow-hidden h-[400px] sm:h-[450px]">
        
        {/* Slides Track */}
        <div 
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {sliders.map((slide: any) => (
            <div key={slide.id} className="min-w-full relative h-full flex-shrink-0 cursor-pointer">
              <img 
                src={slide.image || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80"} 
                alt={slide.title || 'Slide Image'}
                className="w-full h-full object-cover object-center"
              />
              
              {/* Dark overlay for contrast */}
              <div 
                className="absolute inset-0 bg-black transition-opacity duration-300"
                style={{ opacity: (slide.overlayOpacity ?? 50) / 100 }}
              ></div>

              {/* Hero Text Content */}
              <div className={`absolute inset-0 flex flex-col justify-center px-8 sm:px-16 md:px-24 ${
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
                      className="inline-flex items-center justify-center bg-[#00a651] hover:bg-[#008c44] text-white text-[13px] font-semibold px-8 py-3.5 rounded-full transition-all uppercase tracking-wide group/btn"
                    >
                      {slide.buttonText}
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {sliders.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-[#00a651] backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 ml-[-2px]" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-[#00a651] backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 mr-[-2px]" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {sliders.length > 1 && (
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

