import React from 'react';
import { MapPin, Split, ArrowRight, Calendar } from 'lucide-react';

export const CatalogView = ({
  locations = [],
  onSelectLocation,
  onOpenMapLocation,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 text-neutral-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/60">
        <div>
          <h2 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Архивные локации Минска
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Коллекция исторических объектов с подтвержденными архивными фотосвидетельствами
          </p>
        </div>
        <div className="text-xs font-mono text-neutral-400 bg-neutral-900/60 px-3 py-1.5 rounded-xl border border-neutral-800/60 self-start sm:self-auto backdrop-blur-md">
          Объектов в базе: <strong className="text-white">{locations.length}</strong>
        </div>
      </div>

      {/* Grid of locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => {
          return (
            <div
              key={loc.id}
              className="bg-black/60 backdrop-blur-xl border border-neutral-800/60 rounded-3xl overflow-hidden shadow-2xl hover:border-neutral-700/80 transition-all duration-300 flex flex-col group"
            >
              {/* Photo */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={loc.modernImage}
                  alt={loc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Year Badges */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-md border border-neutral-800/80 flex items-center gap-1.5 shadow-md">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  <span>Архив: {loc.archiveYear}</span>
                </div>

                <div className="absolute bottom-2.5 left-3 text-[11px] text-neutral-300 font-mono flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-800/80">
                  <MapPin className="w-3 h-3 text-white" />
                  <span>{loc.district}</span>
                </div>
              </div>

              {/* Text */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-neutral-200 transition-colors">
                    {loc.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {loc.subtitle}
                  </p>
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-neutral-800/60 flex items-center gap-2">
                  <button
                    onClick={() => onSelectLocation(loc)}
                    className="flex-1 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800/70 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/70 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Сравнить эпохи</span>
                  </button>

                  <button
                    onClick={() => onOpenMapLocation(loc)}
                    className="p-2 rounded-xl bg-white hover:bg-neutral-200 text-black transition-all shadow-md active:scale-95"
                    title="Показать на карте"
                  >
                    <ArrowRight className="w-4 h-4" />
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
