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
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState('slider'); // 'slider' | 'history'
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  if (!location) return null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl backdrop-blur-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
        isDark 
          ? 'bg-neutral-950/85 border-neutral-800/80 text-neutral-100' 
          : 'bg-white/95 border-neutral-200 text-neutral-900'
      }`}>
        
        {/* Header */}
        <div className={`p-5 sm:p-7 border-b relative transition-colors ${
          isDark 
            ? 'border-neutral-800/60 bg-neutral-900/40' 
            : 'border-neutral-200 bg-neutral-50/80'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`} />
                <span className={isDark ? 'text-white' : 'text-neutral-800 font-bold'}>{location.district}</span>
                <span>•</span>
                <span>Архивные кадры: {location.archiveYear}</span>
              </div>
              <h2 className={`font-bold text-xl sm:text-2xl tracking-tight ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}>
                {location.title}
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed font-sans max-w-2xl ${
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                {location.subtitle}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                title="Поделиться ссылкой"
                className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isDark 
                    ? 'bg-neutral-900/60 border-neutral-800/70 text-neutral-300 hover:text-white hover:bg-neutral-850' 
                    : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black hover:bg-neutral-200'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Скопировано' : 'Поделиться'}</span>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-neutral-900/60 border-neutral-800/70 text-neutral-400 hover:text-white hover:bg-neutral-850' 
                    : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-200'
                }`}
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex items-center gap-1.5 sm:gap-2 mt-5 pt-3 border-t overflow-x-auto scrollbar-none text-xs sm:text-sm ${
            isDark ? 'border-neutral-800/60' : 'border-neutral-200'
          }`}>
            <button
              onClick={() => setActiveTab('slider')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'slider'
                  ? isDark 
                    ? 'bg-white text-black font-semibold shadow-xs' 
                    : 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : isDark 
                    ? 'bg-neutral-900/50 border border-neutral-800/60 text-neutral-400 hover:text-white' 
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Сравнение эпох</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'history'
                  ? isDark 
                    ? 'bg-white text-black font-semibold shadow-xs' 
                    : 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : isDark 
                    ? 'bg-neutral-900/50 border border-neutral-800/60 text-neutral-400 hover:text-white' 
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Историческая справка</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
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
                theme={theme}
              />
            </div>
          )}

          {/* TAB 2: ARCHIVE CHRONICLE */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div className={`p-5 rounded-2xl border space-y-3 backdrop-blur-md transition-colors ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800/60' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold ${
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  <BookOpen className={`w-4 h-4 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
                  <span>Официальная градостроительная хроника</span>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed font-sans ${
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  {location.historicalFact}
                </p>
              </div>

              <div className={`p-4 rounded-xl border text-xs space-y-1 transition-colors ${
                isDark 
                  ? 'bg-neutral-900/40 border-neutral-850/60 text-neutral-400' 
                  : 'bg-neutral-50/60 border-neutral-200 text-neutral-500'
              }`}>
                <div className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
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
