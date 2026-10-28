import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  BookmarkCheck, 
  Split, 
  Mic, 
  Compass, 
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WEEKLY_QUESTS, BADGES } from '../../data/weeklyQuests';

export const QuestsView = () => {
  const [quests, setQuests] = useState(WEEKLY_QUESTS);
  const [badges, setBadges] = useState(BADGES);

  const handleToggleQuest = (questId) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          const nextCompleted = !q.completed;
          if (nextCompleted) {
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.7 },
              colors: ['#ffffff', '#a1a1aa', '#71717a', '#27272a'],
            });
          }
          return { ...q, completed: nextCompleted };
        }
        return q;
      })
    );
  };

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Mic': return Mic;
      case 'BookmarkCheck': return BookmarkCheck;
      case 'Split': return Split;
      case 'ShieldCheck': return ShieldCheck;
      case 'Compass': return Compass;
      default: return Award;
    }
  };

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-neutral-100">
      
      {/* Manifest (Slide 6) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
          <Award className="w-4 h-4 text-white" />
          <span>Архивная этика участия</span>
        </div>
        <h2 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
          Вовлечение без конкурса популярности
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl mt-2 font-sans">
          Мы принципиально отказались от лайков, рейтингов и борьбы за популярность. Память — это не соревнование. В проекте «Место помнит» поощряется аккуратная исследовательская работа: проверка источников, запись свидетельств пожилых родственников и сохранение уважения к деталям прошлого.
        </p>

        {/* Progress summary */}
        <div className="mt-5 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-white shrink-0" />
            <div>
              <div className="font-semibold text-white text-sm">
                Ваш личный вклад в коллективную память Минска
              </div>
              <div className="text-neutral-400 text-[11px] font-mono">
                Выполнено заданий: <strong className="text-white">{completedCount}</strong> из {quests.length}
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-neutral-200 bg-black px-3 py-1.5 rounded-lg border border-neutral-800 shrink-0 self-start sm:self-auto flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>{completedCount === quests.length ? 'Все задания недели выполнены' : 'Неделя краеведческого поиска'}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Weekly Quests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">
            Задания недели для краеведов и семей
          </h3>
          <span className="text-xs text-neutral-500 font-mono">Обновляются каждый понедельник</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                quest.completed
                  ? 'bg-neutral-900/90 border-neutral-700'
                  : 'bg-neutral-950 border-neutral-850 hover:border-neutral-750'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {quest.tag}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      +{quest.points} очков архива
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-white">
                    {quest.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
                    {quest.description}
                  </p>
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => handleToggleQuest(quest.id)}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    quest.completed
                      ? 'bg-white text-black'
                      : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{quest.completed ? 'Выполнено' : 'Отметить'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Badges */}
      <div className="space-y-4 pt-4 border-t border-neutral-850">
        <div>
          <h3 className="font-bold text-lg text-white">
            Значки исследователя и хранителя
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Присуждаются за качество работы с воспоминаниями и уважение к первоисточникам.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {badges.map((badge) => {
            const IconComponent = getBadgeIcon(badge.icon);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all ${
                  badge.unlocked
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-neutral-950/40 border-neutral-900 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    badge.unlocked
                      ? 'bg-neutral-900 border border-neutral-700 text-white'
                      : 'bg-neutral-900 text-neutral-600'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs sm:text-sm text-white">
                      {badge.title}
                    </h5>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      {badge.unlocked ? 'Получен' : 'В процессе'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
