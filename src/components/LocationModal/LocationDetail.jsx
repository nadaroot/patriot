import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Volume2, 
  Split, 
  BookOpen, 
  Plus, 
  Share2, 
  Check, 
  Sparkles
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { VoicePlayer } from './VoicePlayer';
import { CATEGORIES } from '../../data/categories';

export const LocationDetail = ({
  location,
  onClose,
  onOpenAddStoryForLocation,
}) => {
  const [activeTab, setActiveTab] = useState('voices'); // 'voices' | 'slider' | 'history'
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [copied, setCopied] = useState(false);

  if (!location) return null;

  const voices = location.voices || [];
  const filteredVoices = selectedTopic === 'all'
    ? voices
    : voices.filter((v) => v.topic === selectedTopic);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-7 border-b border-neutral-850 bg-neutral-900/60 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                <MapPin className="w-3.5 h-3.5 text-neutral-300" />
                <span>{location.district}</span>
                <span>•</span>
                <span>Архивные свидетельства: {location.archiveYear}</span>
              </div>
              <h2 className="font-bold text-xl sm:text-2xl text-white tracking-tight">
                {location.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans max-w-2xl">
                {location.subtitle}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                title="Поделиться ссылкой"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Скопировано' : 'Поделиться'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-5 pt-3 border-t border-neutral-800 overflow-x-auto scrollbar-none text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('voices')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'voices'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Голоса очевидцев ({voices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('slider')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'slider'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Раньше и сейчас</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Краеведческая справка</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-neutral-200">
          
          {/* TAB 1: VOICES */}
          {activeTab === 'voices' && (
            <div className="space-y-5">
              {/* Topic Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider shrink-0 mr-1">
                  Тема:
                </span>
                <button
                  onClick={() => setSelectedTopic('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedTopic === 'all'
                      ? 'bg-white text-black font-semibold'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Все ({voices.length})
                </button>
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                  const count = voices.filter((v) => v.topic === cat.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedTopic(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedTopic === cat.id
                          ? 'bg-white text-black font-semibold'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Voice Cards */}
              <div className="space-y-4">
                {filteredVoices.map((voice) => (
                  <VoicePlayer
                    key={voice.id}
                    voice={voice}
                    locationTitle={location.title}
                  />
                ))}
              </div>

              {/* Call to add story */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Помните это место в другие годы?
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Сохраните воспоминание, семейную фотографию или запишите пару минут устного рассказа.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddStoryForLocation(location);
                  }}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-md shrink-0 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить историю</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE / AFTER SLIDER */}
          {activeTab === 'slider' && (
            <div className="space-y-4">
              <BeforeAfterSlider
                archiveImage={location.archiveImage}
                modernImage={location.modernImage}
                archiveYear={location.archiveYear}
                modernYear={location.modernYear}
                archiveCaption={location.archiveImageCaption}
                modernCaption={location.modernImageCaption}
              />
            </div>
          )}

          {/* TAB 3: ARCHIVE CHRONICLE */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>Официальная градостроительная хроника</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {location.historicalFact}
                </p>
              </div>

              {/* Principle notice */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-850 text-xs text-neutral-400 space-y-1">
                <div className="font-semibold text-neutral-200">
                  Принцип разделения памяти и фактов:
                </div>
                <p className="leading-relaxed">
                  Официальные данные фиксируют даты и постановления, а живые голоса очевидцев сохраняют повседневную память: где гуляли, какие запахи помнят и как относились к переменам. Одно дополняет другое.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
