import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Award, 
  Plus, 
  Menu, 
  X, 
  GraduationCap,
  History,
  Activity
} from 'lucide-react';

export const Header = ({ activeTab, onTabChange, onOpenAddWizard, storyCount = 15 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'map', label: 'Карта памяти', icon: MapPin },
    { id: 'catalog', label: 'Места и голоса', icon: History },
    { id: 'ai', label: 'ИИ-помощник', icon: Sparkles },
    { id: 'quests', label: 'Задания недели', icon: Award },
    { id: 'guide', label: 'Школа и архив', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-850 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Concept */}
          <div 
            onClick={() => onTabChange('map')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center shadow-lg group-hover:border-neutral-700 transition-colors">
              <Compass className="w-5 h-5 text-neutral-200 group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                  Место помнит
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800">
                  Минск · 2026
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                У каждого места — больше одной истории
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
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
                      ? 'bg-neutral-850 text-white border border-neutral-750 shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right actions: AI status & Add Story */}
          <div className="flex items-center gap-2.5">
            {/* FreeDeepSeek pill */}
            <div 
              onClick={() => onTabChange('ai')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:border-neutral-700 cursor-pointer transition-colors"
              title="ИИ-бэкенд: FreeDeepSeek (100.71.166.18)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>FreeDeepSeek AI</span>
            </div>

            <button
              onClick={onOpenAddWizard}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-neutral-200 active:scale-95 text-black shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">Добавить воспоминание</span>
              <span className="xs:hidden">Добавить</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900"
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-neutral-850 px-4 pt-2 pb-4 space-y-1">
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
                    ? 'bg-neutral-850 text-white border border-neutral-800'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
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
