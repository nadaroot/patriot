import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Split, 
  Menu, 
  X, 
  History,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export const Header = ({ 
  activeTab, 
  onTabChange, 
  theme = 'dark', 
  onToggleTheme,
  onOpenNavigator
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'map', label: 'Карта Минска', icon: MapPin },
    { id: 'catalog', label: 'Архив мест', icon: History },
    { id: 'compare', label: 'Сравнение эпох', icon: Split },
    { id: 'ai', label: 'ИИ-исследователь', icon: Sparkles },
  ];

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 transition-colors backdrop-blur-xl border-b ${
      isDark 
        ? 'bg-black/60 border-neutral-800/60 text-white' 
        : 'bg-white/80 border-neutral-200/80 text-neutral-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Navigator Button */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onTabChange('map')} 
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800 text-white group-hover:border-neutral-600' 
                  : 'bg-neutral-100 border-neutral-300 text-black group-hover:border-neutral-400'
              }`}>
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <span className="font-bold text-base tracking-tight">
                Место помнит
              </span>
            </div>

            {/* Quick Navigator Button */}
            <button
              onClick={onOpenNavigator}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-850' 
                  : 'bg-neutral-100/80 border-neutral-300/80 text-neutral-700 hover:text-black hover:bg-neutral-200'
              }`}
              title="Открыть навигатор со всеми локациями города"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Навигатор</span>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? isDark 
                        ? 'bg-neutral-850/80 text-white border border-neutral-700/80 shadow-xs' 
                        : 'bg-neutral-900 text-white border border-neutral-900 shadow-xs'
                      : isDark 
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/50' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle (Replaced Patriot AI badge) */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-neutral-900/70 border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-800' 
                  : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:text-black hover:bg-neutral-200'
              }`}
              title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
              aria-label="Смена темы"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Mobile Navigator trigger */}
            <button
              onClick={onOpenNavigator}
              className={`sm:hidden p-2 rounded-xl border text-xs font-semibold ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300' 
                  : 'bg-neutral-100 border-neutral-300 text-neutral-800'
              }`}
              title="Навигатор"
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl border ${
                isDark 
                  ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900' 
                  : 'border-neutral-300 text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-4 pt-2 pb-4 space-y-1 ${
          isDark ? 'bg-black/95 border-neutral-800/80' : 'bg-white/95 border-neutral-200'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? isDark 
                      ? 'bg-neutral-850 text-white border border-neutral-750' 
                      : 'bg-neutral-900 text-white'
                    : isDark 
                      ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/60' 
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
