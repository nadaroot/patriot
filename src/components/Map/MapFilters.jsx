import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { Search, X } from 'lucide-react';

export const MapFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="bg-black/60 backdrop-blur-xl border border-neutral-800/60 rounded-2xl p-2.5 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      {/* Compact Search Bar */}
      <div className="relative flex-1">
        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по историческим местам, улицам или фактам..."
          className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-neutral-900/60 border border-neutral-800/60 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900/90 transition-all placeholder:text-neutral-500 text-white"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            title="Очистить поиск"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Categories Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none text-xs">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all font-medium text-[11px] ${
                isSelected
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-neutral-900/50 border border-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-850/60'
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
