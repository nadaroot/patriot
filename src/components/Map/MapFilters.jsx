import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { Search, X } from 'lucide-react';

export const MapFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-2.5 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 transition-colors ${
      isDark ? 'bg-black/60 border-neutral-800/60' : 'bg-white/80 border-slate-200 shadow-sm'
    }`}>
      {/* Compact Search Bar */}
      <div className="relative flex-1">
        <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
          isDark ? 'text-neutral-400' : 'text-slate-400'
        }`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по историческим местам, улицам или фактам..."
          className={`w-full pl-8 pr-7 py-1.5 rounded-xl text-xs focus:outline-none transition-all ${
            isDark 
              ? 'bg-neutral-900/60 border border-neutral-800/60 focus:border-neutral-500 focus:bg-neutral-900 text-white placeholder:text-neutral-500' 
              : 'bg-slate-100 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 placeholder:text-slate-400'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
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
                  ? isDark
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'bg-slate-900 text-white font-semibold shadow-xs'
                  : isDark
                    ? 'bg-neutral-900/50 border border-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-850'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-black hover:bg-slate-200'
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
