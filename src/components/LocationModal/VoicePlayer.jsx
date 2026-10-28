import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, User, ShieldCheck, Clock } from 'lucide-react';
import { MATERIAL_TYPES } from '../../data/categories';

export const VoicePlayer = ({
  voice,
  locationTitle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    synthRef.current.cancel();

    const textToSpeak = `${voice.quote}. ${voice.fullText}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.95;
    utterance.pitch = 0.98;

    const voices = synthRef.current.getVoices();
    const ruVoice = voices.find((v) => v.lang.startsWith('ru') || v.name.includes('Russian'));
    if (ruVoice) {
      utterance.voice = ruVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    utterance.onboundary = (e) => {
      if (textToSpeak.length > 0) {
        const percent = Math.min(100, Math.round((e.charIndex / textToSpeak.length) * 100));
        setProgress(percent);
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const typeInfo = MATERIAL_TYPES[voice.type] || MATERIAL_TYPES.memory;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
      isPlaying 
        ? 'bg-neutral-850 border-white/40 ring-1 ring-white/20 shadow-2xl' 
        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
    }`}>
      {/* Top author row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
            <User className="w-4 h-4 text-neutral-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white">
                {voice.author}
              </span>
              {voice.isAnonymous && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Анонимно
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
              <span>{voice.year}</span>
              {voice.audioDuration && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {voice.audioDuration}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Type badge: Личное воспоминание vs Архив vs Факт */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border bg-neutral-800/80 border-neutral-700 text-neutral-300">
          <ShieldCheck className="w-3 h-3 text-neutral-400" />
          <span>{typeInfo.label}</span>
        </div>
      </div>

      {/* Quote */}
      <blockquote className="text-xs sm:text-sm text-neutral-200 italic font-serif leading-relaxed mb-3 pl-3 border-l-2 border-neutral-600">
        {voice.quote}
      </blockquote>

      {/* Full Memoir Text */}
      <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-4">
        {voice.fullText}
      </p>

      {/* Source note */}
      {voice.source && (
        <div className="text-[10px] text-neutral-500 font-mono mb-3">
          Источник: {voice.source}
        </div>
      )}

      {/* Audio Playback Bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isPlaying
              ? 'bg-white text-black'
              : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Пауза</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Слушать голос</span>
            </>
          )}
        </button>

        {/* Progress Waveform indicator */}
        <div className="flex-1 bg-neutral-800 h-1.5 rounded-full overflow-hidden relative">
          <div
            className="bg-white h-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-mono text-neutral-400 shrink-0">
          {isPlaying ? `${progress}%` : voice.audioDuration || '1:30'}
        </span>
      </div>
    </div>
  );
};
