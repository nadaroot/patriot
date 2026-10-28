import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Split, 
  BookOpen, 
  Share2, 
  Check
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';

export const LocationDetail = ({
  location,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('slider'); // 'slider' | 'history'
  const [copied, setCopied] = useState(false);

  if (!location) return null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-950/80 backdrop-blur-2xl border border-neutral-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-7 border-b border-neutral-800/60 bg-neutral-900/40 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                <MapPin className="w-3.5 h-3.5 text-neutral-300" />
                <span>{location.district}</span>
                <span>•</span>
                <span>Архивные кадры: {location.archiveYear}</span>
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
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900/60 border border-neutral-800/70 text-neutral-300 hover:text-white hover:bg-neutral-850 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-neutral-300" />}
                <span className="hidden sm:inline">{copied ? 'Скопировано' : 'Поделиться'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/70 text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-5 pt-3 border-t border-neutral-800/60 overflow-x-auto scrollbar-none text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('slider')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'slider'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-neutral-900/50 border border-neutral-800/60 text-neutral-400 hover:text-white'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Сравнение эпох</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-neutral-900/50 border border-neutral-800/60 text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Историческая справка</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-neutral-200">
          
          {/* TAB 1: BEFORE / AFTER SLIDER */}
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

          {/* TAB 2: ARCHIVE CHRONICLE */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/60 space-y-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>Официальная градостроительная хроника</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {location.historicalFact}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-850/60 text-xs text-neutral-400 space-y-1">
                <div className="font-semibold text-neutral-200">
                  Источниковая база:
                </div>
                <p className="leading-relaxed">
                  Материалы Белорусского государственного архива кинофотофонодокументов (БГАКФФД) и проектных институтов Минска.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
