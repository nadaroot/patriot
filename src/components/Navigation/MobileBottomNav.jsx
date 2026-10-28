import React from 'react';
import { MapPin, History, Plus, Award, Sparkles } from 'lucide-react';

export const MobileBottomNav = ({
  activeTab,
  onTabChange,
  onOpenAddWizard,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-850 md:hidden shadow-2xl safe-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        
        {/* Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'map' ? 'text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'map' ? 'bg-neutral-850' : ''}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Карта</span>
        </button>

        {/* Catalog */}
        <button
          onClick={() => onTabChange('catalog')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'catalog' ? 'text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'catalog' ? 'bg-neutral-850' : ''}`}>
            <History className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Места</span>
        </button>

        {/* Center Add button */}
        <div className="flex-1 flex items-center justify-center -mt-4">
          <button
            onClick={onOpenAddWizard}
            className="w-12 h-12 rounded-full bg-white text-black shadow-2xl border-2 border-neutral-800 flex items-center justify-center active:scale-90 transition-all hover:bg-neutral-200"
            aria-label="Добавить воспоминание"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Quests */}
        <button
          onClick={() => onTabChange('quests')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'quests' ? 'text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'quests' ? 'bg-neutral-850' : ''}`}>
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Задания</span>
        </button>

        {/* AI */}
        <button
          onClick={() => onTabChange('ai')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'ai' ? 'text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-neutral-850' : ''}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">ИИ</span>
        </button>
      </div>
    </nav>
  );
};
