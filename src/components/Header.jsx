import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Split, 
  Menu, 
  X, 
  History
} from 'lucide-react';

export const Header = ({ activeTab, onTabChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'map', label: '3D Карта', icon: MapPin },
    { id: 'catalog', label: 'Архив мест', icon: History },
    { id: 'compare', label: 'Сравнение эпох', icon: Split },
    { id: 'ai', label: 'ИИ-исследователь', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-neutral-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => onTabChange('map')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center group-hover:border-neutral-700 transition-colors">
              <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              Место помнит
            </span>
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

          {/* Right Status */}
          <div className="flex items-center gap-2">
            <div 
              onClick={() => onTabChange('ai')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 hover:border-neutral-700 cursor-pointer transition-colors"
              title="Нейросетевая модель Патриот AI"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>Патриот AI</span>
            </div>

            {/* Mobile menu button */}
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

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-b border-neutral-850 px-4 pt-2 pb-4 space-y-1">
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
