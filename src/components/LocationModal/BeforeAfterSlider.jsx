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
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <Split className="w-4 h-4 text-white" />
          <span className="font-semibold">Интерактивное сопоставление эпох</span>
        </div>
        
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setSliderPos(0)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              sliderPos === 0 ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Только архив ({archiveYear})
          </button>
          <button
            onClick={() => setSliderPos(50)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              sliderPos === 50 ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            50 / 50
          </button>
          <button
            onClick={() => setSliderPos(100)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              sliderPos === 100 ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Сегодня ({modernYear})
          </button>
        </div>
      </div>

      {/* Main Slider Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="slider-container relative w-full h-[320px] sm:h-[440px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-neutral-800 shadow-2xl bg-black"
      >
        {/* Background Image: Modern */}
        <img
          src={modernImage}
          alt={`Современный вид ${modernYear}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Foreground Image: Archive (clipped by sliderPos) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={archiveImage}
            alt={`Архивный снимок ${archiveYear}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              maxWidth: 'none',
            }}
          />
        </div>

        {/* Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border-2 border-white text-white flex items-center justify-center shadow-2xl">
            <Split className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Year Badges */}
        <div className="absolute bottom-3 left-3 z-30 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-neutral-800 text-white text-[11px] font-mono font-bold flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-neutral-400" />
          <span>Архив · {archiveYear}</span>
        </div>

        <div className="absolute bottom-3 right-3 z-30 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-neutral-800 text-white text-[11px] font-mono font-bold flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span>Наши дни · {modernYear}</span>
        </div>
      </div>

      {/* Captions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-400 pt-1">
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-850">
          <span className="font-semibold text-neutral-200 block mb-1">Слева (Архив):</span>
          <p className="leading-relaxed">{archiveCaption || 'Исторический снимок из фондов БГАКФФД.'}</p>
        </div>
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-850">
          <span className="font-semibold text-neutral-200 block mb-1">Справа (Современность):</span>
          <p className="leading-relaxed">{modernCaption || 'Современное состояние локации в городской среде.'}</p>
        </div>
      </div>
    </div>
  );
};
