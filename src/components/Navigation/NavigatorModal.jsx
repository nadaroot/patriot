import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Split, 
  Compass, 
  History, 
  Sparkles, 
  ArrowUpRight,
  Filter,
  Calendar
} from 'lucide-react';

export const NavigatorModal = ({
  isOpen,
  onClose,
  locations = [],
  activeTab,
  onTabChange,
  onSelectLocation,
  theme = 'dark',
}) => {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const isDark = theme === 'dark';

  const districts = useMemo(() => {
    const list = new Set(locations.map((l) => l.district).filter(Boolean));
    return ['all', ...Array.from(list)];
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = loc.title.toLowerCase().includes(q);
        const matchSub = (loc.subtitle || '').toLowerCase().includes(q);
        const matchDist = (loc.district || '').toLowerCase().includes(q);
        const matchFact = (loc.historicalFact || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchDist && !matchFact) return false;
      }
      if (selectedDistrict !== 'all') {
        if (loc.district !== selectedDistrict) return false;
      }
      return true;
    });
  }, [locations, search, selectedDistrict]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl backdrop-blur-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
        isDark 
          ? 'bg-neutral-950/90 border-neutral-800 text-neutral-100' 
          : 'bg-white/95 border-neutral-200 text-neutral-900'
      }`}>
        
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 transition-colors ${
          isDark 
            ? 'border-neutral-800/60 bg-neutral-900/40' 
            : 'border-neutral-200 bg-neutral-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              isDark 
                ? 'bg-neutral-900/80 border-neutral-800 text-white' 
                : 'bg-white border-neutral-200 text-black shadow-xs'
            }`}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-lg sm:text-xl tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Навигатор по историческому Минску
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Полный каталог локаций, разделов и быстрое переключение эпох ({locations.length} объектов)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white' 
                : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-200'
            }`}
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Shortcuts */}
        <div className={`px-5 py-3 border-b grid grid-cols-2 sm:grid-cols-4 gap-2 transition-colors ${
          isDark ? 'border-neutral-800/50 bg-black/40' : 'border-neutral-200 bg-neutral-100/60'
        }`}>
          {[
            { id: 'map', label: '3D Карта', icon: MapPin },
            { id: 'catalog', label: 'Архив мест', icon: History },
            { id: 'compare', label: 'Сравнение эпох', icon: Split },
            { id: 'ai', label: 'Патриот AI', icon: Sparkles },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  onTabChange(sec.id);
                  onClose();
                }}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-semibold transition-all border ${
                  isActive
                    ? isDark 
                      ? 'bg-white text-black border-white shadow-md' 
                      : 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                    : isDark 
                      ? 'bg-neutral-900/50 border-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-800/60' 
                      : 'bg-white border-neutral-200 text-neutral-700 hover:text-black hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & District Filter */}
        <div className={`p-4 sm:p-5 border-b space-y-3 transition-colors ${
          isDark ? 'border-neutral-800/50' : 'border-neutral-200 bg-white/50'
        }`}>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по любому зданию, улице или эпохе..."
              className={`w-full pl-9 pr-8 py-2 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-all ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-600' 
                  : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 shadow-2xs'
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className={`text-[10px] font-mono uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1 ${
              isDark ? 'text-neutral-500' : 'text-neutral-600'
            }`}>
              <Filter className="w-3 h-3" /> Район:
            </span>
            {districts.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-2.5 py-1 rounded-xl whitespace-nowrap text-[11px] font-medium transition-all ${
                  selectedDistrict === d
                    ? isDark ? 'bg-white text-black font-semibold' : 'bg-neutral-900 text-white font-semibold'
                    : isDark 
                      ? 'bg-neutral-900/60 border border-neutral-800/60 text-neutral-400 hover:text-white' 
                      : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-black'
                }`}
              >
                {d === 'all' ? 'Все районы' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Locations List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                isDark 
                  ? 'bg-neutral-900/40 hover:bg-neutral-900/80 border-neutral-800/60 hover:border-neutral-700/80' 
                  : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border ${
                  isDark ? 'bg-black border-neutral-800' : 'bg-neutral-100 border-neutral-200'
                }`}>
                  <img
                    src={loc.modernImage}
                    alt={loc.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <div className={`flex items-center gap-2 text-[10px] font-mono mb-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-800'}`}>{loc.district}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {loc.archiveYear}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm transition-colors ${
                    isDark ? 'text-white group-hover:text-neutral-200' : 'text-neutral-900 group-hover:text-black'
                  }`}>
                    {loc.title}
                  </h4>
                  <p className={`text-xs line-clamp-1 max-w-xl ${
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  }`}>
                    {loc.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => {
                    onTabChange('compare');
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isDark 
                      ? 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/60 text-neutral-200' 
                      : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-800'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Сравнить</span>
                </button>

                <button
                  onClick={() => {
                    onTabChange('map');
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 transition-all active:scale-95 ${
                    isDark 
                      ? 'bg-white hover:bg-neutral-200 text-black' 
                      : 'bg-neutral-900 hover:bg-black text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>На карте</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
