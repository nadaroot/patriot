import React from 'react';
import { MapPin, History, Split, Sparkles } from 'lucide-react';

export const MobileBottomNav = ({
  activeTab,
  onTabChange,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const navItems = [
    { id: 'map', label: '3D Карта', icon: MapPin },
    { id: 'catalog', label: 'Архив', icon: History },
    { id: 'compare', label: 'Сравнение', icon: Split },
    { id: 'ai', label: 'Патриот AI', icon: Sparkles },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t md:hidden shadow-2xl safe-bottom transition-colors ${
      isDark
        ? 'bg-neutral-950/95 border-neutral-850 text-white'
        : 'bg-white/95 border-neutral-200 text-neutral-900'
    }`}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                isActive 
                  ? isDark ? 'text-white font-semibold' : 'text-neutral-900 font-semibold'
                  : isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive 
                  ? isDark ? 'bg-neutral-850 text-white' : 'bg-neutral-100 text-black shadow-xs'
                  : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-sans">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
