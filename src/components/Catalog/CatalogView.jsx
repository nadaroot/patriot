import React from 'react';
import { MapPin, Split, ArrowRight, Calendar } from 'lucide-react';

export const CatalogView = ({
  locations = [],
  onSelectLocation,
  onOpenMapLocation,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
        isDark ? 'border-neutral-800/60 text-white' : 'border-[#e5dcce] text-[#2c261e]'
      }`}>
        <div>
          <h2 className="font-bold text-2xl sm:text-3xl tracking-tight">
            Архивные локации Минска
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-[#635747]'}`}>
            Коллекция исторических объектов с подтверждёнными архивными фотосвидетельствами
          </p>
        </div>
        <div className={`text-xs font-mono px-3 py-1.5 rounded-xl border self-start sm:self-auto backdrop-blur-md ${
          isDark 
            ? 'bg-neutral-900/60 border-neutral-800/60 text-neutral-400' 
            : 'bg-[#efe8dc] border-[#e0d6c5] text-[#5e5344]'
        }`}>
          Объектов в базе: <strong className={isDark ? 'text-white' : 'text-[#2c261e]'}>{locations.length}</strong>
        </div>
      </div>

      {/* Grid of locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => {
          return (
            <div
              key={loc.id}
              className={`rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group ${
                isDark 
                  ? 'bg-neutral-950/70 border-neutral-800/70 hover:border-neutral-700 text-neutral-100' 
                  : 'bg-[#fcfbf7] border-[#e5dcce] hover:border-[#cfc3af] text-[#2c261e] shadow-sm'
              }`}
            >
              {/* Photo */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={loc.modernImage}
                  alt={loc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Year Badges */}
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-md border border-neutral-700/80 flex items-center gap-1.5 shadow-md">
                  <Calendar className="w-3 h-3 text-neutral-300" />
                  <span>Архив: {loc.archiveYear}</span>
                </div>

                <div className="absolute bottom-2.5 left-3 text-[11px] text-white font-mono flex items-center gap-1 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-700/80">
                  <MapPin className="w-3 h-3 text-white" />
                  <span>{loc.district}</span>
                </div>
              </div>

              {/* Text */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base sm:text-lg leading-snug transition-colors">
                    {loc.title}
                  </h3>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#635747]'}`}>
                    {loc.subtitle}
                  </p>
                </div>

                {/* Buttons */}
                <div className={`pt-3 border-t flex items-center gap-2 ${isDark ? 'border-neutral-800/60' : 'border-[#e5dcce]'}`}>
                  <button
                    onClick={() => onSelectLocation(loc)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isDark 
                        ? 'bg-neutral-900/80 border border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-800' 
                        : 'bg-[#efe8dc] border border-[#e0d6c5] text-[#2c261e] hover:bg-[#e4dcce]'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Сравнить эпохи</span>
                  </button>

                  <button
                    onClick={() => onOpenMapLocation(loc)}
                    className={`p-2 rounded-xl transition-all shadow-sm active:scale-95 ${
                      isDark 
                        ? 'bg-white hover:bg-neutral-200 text-black' 
                        : 'bg-[#2c261e] hover:bg-[#1a1612] text-[#fbf9f4]'
                    }`}
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
