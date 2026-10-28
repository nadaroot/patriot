import React from 'react';
import { MapPin, Volume2, ArrowRight, Calendar, BookOpen } from 'lucide-react';

export const CatalogView = ({
  locations = [],
  onSelectLocation,
  onOpenMapLocation,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 text-neutral-100">
      
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <h2 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Пилотные локации Минска
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Собрание устных свидетельств, архивных хроник и визуальных сопоставлений «раньше и сейчас»
          </p>
        </div>
        <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 self-start sm:self-auto">
          Всего локаций: <strong className="text-white">{locations.length}</strong> · Голосов: <strong className="text-white">{locations.reduce((acc, l) => acc + (l.voices?.length || 0), 0)}</strong>
        </div>
      </div>

      {/* Grid of location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => {
          const voiceCount = loc.voices?.length || loc.stats?.witnessCount || 1;
          return (
            <div
              key={loc.id}
              className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl hover:border-neutral-700 transition-all duration-300 flex flex-col group"
            >
              {/* Photo Preview */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={loc.modernImage}
                  alt={loc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Archive Year Badge */}
                <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-md border border-neutral-800 flex items-center gap-1.5 shadow-md">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  <span>Архив: {loc.archiveYear}</span>
                </div>

                <div className="absolute top-3 right-3 bg-white text-black text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  <span>{voiceCount}</span>
                </div>

                <div className="absolute bottom-2.5 left-3 text-[11px] text-neutral-300 font-mono drop-shadow-md flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10">
                  <MapPin className="w-3 h-3 text-white" />
                  <span>{loc.district}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-neutral-200 transition-colors">
                    {loc.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {loc.subtitle}
                  </p>
                </div>

                {/* Quote */}
                {loc.voices?.[0] && (
                  <blockquote className="text-[11px] italic text-neutral-300 font-serif border-l-2 border-neutral-600 pl-2.5 py-0.5 line-clamp-2 bg-neutral-900 rounded-r-md">
                    {loc.voices[0].quote}
                  </blockquote>
                )}

                {/* Card Actions */}
                <div className="pt-3 border-t border-neutral-850 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenMapLocation(loc)}
                    className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 py-1 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>На карте</span>
                  </button>

                  <button
                    onClick={() => onSelectLocation(loc)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Открыть карточку</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
