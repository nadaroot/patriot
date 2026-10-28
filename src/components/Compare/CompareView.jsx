import React, { useState } from 'react';
import { BeforeAfterSlider } from '../LocationModal/BeforeAfterSlider';
import { MapPin, Calendar, Clock, BookOpen, Layers } from 'lucide-react';

export const CompareView = ({ locations, onOpenMapLocation }) => {
  const [selectedId, setSelectedId] = useState(locations[0]?.id || 'nemiga');

  const selectedLoc = locations.find((l) => l.id === selectedId) || locations[0];

  return (
    <div className="space-y-6 text-neutral-100 max-w-6xl mx-auto">
      {/* Intro Header */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-850 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-neutral-300" />
            <span>Архивная фотофиксация · Черно-белый оригинал vs Современность</span>
          </div>
          <h2 className="font-bold text-2xl text-white tracking-tight">
            Сравнение эпох: Минск в деталях
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Подлинные архивные кадры из фондов БГАКФФД, сопоставленные с современными фотографиями с идентичного ракурса. Двигайте ползунок для анализа городской трансформации.
          </p>
        </div>

        <button
          onClick={() => onOpenMapLocation && onOpenMapLocation(selectedLoc)}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-md shrink-0 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <MapPin className="w-4 h-4" />
          <span>Смотреть на 3D Карте</span>
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
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-xs whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-neutral-850 border-neutral-700 text-white font-semibold shadow-md'
                  : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-800'
              }`}
            >
              <div className="w-6 h-6 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
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
        <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-850 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-850 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                <span>{selectedLoc.district}</span>
                <span>•</span>
                <span>{selectedLoc.archiveYear} — {selectedLoc.modernYear}</span>
              </div>
              <h3 className="font-bold text-xl text-white">
                {selectedLoc.title}
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
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
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
              <BookOpen className="w-4 h-4 text-white" />
              <span>Историко-градостроительная хроника</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              {selectedLoc.historicalFact}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
