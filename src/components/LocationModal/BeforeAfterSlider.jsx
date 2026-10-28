import React, { useState, useRef, useCallback } from 'react';
import { Split, Calendar, Clock } from 'lucide-react';

export const BeforeAfterSlider = ({
  archiveImage,
  modernImage,
  archiveYear = 'Архив',
  modernYear = '2026 г.',
  archiveCaption,
  modernCaption,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percent = (x / rect.width) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    setSliderPos(percent);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Slider Canvas - Pure & Clutter-free */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="slider-container relative w-full h-[340px] sm:h-[480px] rounded-3xl overflow-hidden cursor-ew-resize select-none border border-neutral-800/70 shadow-2xl bg-black"
      >
        {/* Background Image: Modern Color */}
        <img
          src={modernImage}
          alt={`Современный вид ${modernYear}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Foreground Image: Archive B&W (clipped by sliderPos) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={archiveImage}
            alt={`Архивный снимок ${archiveYear}`}
            className="absolute inset-0 w-full h-full object-cover grayscale"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              maxWidth: 'none',
            }}
          />
        </div>

        {/* Center Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/90 backdrop-blur-md border border-white text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Split className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Subtle Year Badges at the bottom corners */}
        <div className="absolute bottom-3 left-3 z-30 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-xl border border-neutral-750/70 text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-xl">
          <Calendar className="w-3 h-3 text-neutral-300" />
          <span>Архив · {archiveYear}</span>
        </div>

        <div className="absolute bottom-3 right-3 z-30 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-xl border border-neutral-750/70 text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-xl">
          <Clock className="w-3 h-3 text-neutral-300" />
          <span>Наши дни · {modernYear}</span>
        </div>
      </div>

      {/* Captions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-400 pt-1">
        <div className="p-3.5 rounded-2xl bg-black/50 backdrop-blur-xl border border-neutral-800/60">
          <span className="font-semibold text-neutral-200 block mb-1">Слева (Архивный кадр):</span>
          <p className="leading-relaxed">{archiveCaption || 'Исторический снимок из фондов БГАКФФД.'}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-black/50 backdrop-blur-xl border border-neutral-800/60">
          <span className="font-semibold text-neutral-200 block mb-1">Справа (Современный вид):</span>
          <p className="leading-relaxed">{modernCaption || 'Современное состояние локации в городской среде.'}</p>
        </div>
      </div>
    </div>
  );
};
