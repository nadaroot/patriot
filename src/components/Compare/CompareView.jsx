import React, { useState } from 'react';
import { BeforeAfterSlider } from '../LocationModal/BeforeAfterSlider';
import { MapPin, BookOpen, Layers } from 'lucide-react';

export const CompareView = ({ locations, onOpenMapLocation, theme = 'dark' }) => {
  const [selectedId, setSelectedId] = useState(locations[0]?.id || 'nemiga');

  const selectedLoc = locations.find((l) => l.id === selectedId) || locations[0];
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 max-w-6xl mx-auto transition-colors ${
      isDark ? 'text-neutral-100' : 'text-slate-900'
    }`}>
      {/* Intro Header */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl ${
        isDark ? 'bg-black/60 border-neutral-800/60' : 'bg-white/80 border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono opacity-70 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Архивная фотофиксация · Ч/Б оригинал vs Цветная современность</span>
          </div>
          <h2 className="font-bold text-2xl tracking-tight">
            Сравнение эпох: Минск в деталях
          </h2>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Подлинные архивные кадры из фондов БГАКФФД, сопоставленные с современными снимками с идентичного ракурса.
          </p>
        </div>

        <button
          onClick={() => onOpenMapLocation && onOpenMapLocation(selectedLoc)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shrink-0 flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-slate-900 hover:bg-black text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Смотреть на Карте</span>
        </button>
      </div>

      {/* Horizontal Location Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLoc?.id;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedId(loc.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border text-xs whitespace-nowrap transition-all shrink-0 backdrop-blur-md ${
                isSelected
                  ? isDark 
                    ? 'bg-neutral-850/80 border-neutral-700 text-white font-semibold shadow-md'
                    : 'bg-slate-900 border-slate-900 text-white font-semibold shadow-md'
                  : isDark
                    ? 'bg-black/50 border-neutral-800/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-700/60">
                <img
                  src={loc.archiveImage}
                  alt={loc.title}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <span>{loc.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      {selectedLoc && (
        <div className={`p-6 rounded-3xl border shadow-xl space-y-6 backdrop-blur-xl ${
          isDark ? 'bg-black/60 border-neutral-800/60' : 'bg-white/85 border-slate-200 shadow-sm'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 ${
            isDark ? 'border-neutral-800/60' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono opacity-70 uppercase tracking-wider mb-1">
                <span>{selectedLoc.district}</span>
                <span>•</span>
                <span>{selectedLoc.archiveYear} — {selectedLoc.modernYear}</span>
              </div>
              <h3 className="font-bold text-xl">
                {selectedLoc.title}
              </h3>
            </div>
            <span className={`text-xs max-w-md text-right hidden sm:block ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              {selectedLoc.subtitle}
            </span>
          </div>

          {/* Slider */}
          <BeforeAfterSlider
            archiveImage={selectedLoc.archiveImage}
            modernImage={selectedLoc.modernImage}
            archiveYear={selectedLoc.archiveYear}
            modernYear={selectedLoc.modernYear}
            archiveCaption={selectedLoc.archiveImageCaption}
            modernCaption={selectedLoc.modernImageCaption}
          />

          {/* Chronicle Fact Card */}
          <div className={`p-5 rounded-2xl border space-y-2 backdrop-blur-md ${
            isDark ? 'bg-neutral-900/60 border-neutral-800/60' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Историко-градостроительная хроника</span>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed font-sans ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              {selectedLoc.historicalFact}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
