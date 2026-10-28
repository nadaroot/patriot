import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { Search, Filter, Layers, X } from 'lucide-react';

export const MapFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="bg-neutral-950/90 backdrop-blur-md border border-neutral-850 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по местам, событиям, авторам или цитатам..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all placeholder:text-neutral-500 text-white"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono shrink-0 self-end sm:self-auto">
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <span>Локаций: <strong className="text-white">{filteredCount}</strong> из {totalCount}</span>
        </div>
      </div>

      {/* Filter Topics */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Темы:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium flex items-center gap-1.5 text-xs ${
                isSelected
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
