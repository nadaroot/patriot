import React, { useState } from 'react';
import { 
  GraduationCap, 
  Building2, 
  Home, 
  Map, 
  Download, 
  FileCheck, 
  Check, 
  BookOpen
} from 'lucide-react';

export const SchoolGuideView = ({ locations = [] }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(locations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mesto_pomnit_minsk_archive_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleDownloadInterviewGuide = () => {
    const guideContent = `ПРОЕКТ «МЕСТО ПОМНИТ» · ПАМЯТКА ИНТЕРВЬЮЕРА ДЛЯ СБОРА УСТНОЙ ИСТОРИИ

1. ПОДГОТОВКА К ИНТЕРВЬЮ:
- Заранее определите место (улица, двор, здание, парк).
- Сформулируйте 3-4 открытых фокус-вопроса: «Что раньше было здесь?», «Что изменилось на вашей памяти?».
- Возьмите смартфон/диктофон и архивные фотографии места, чтобы помочь вызвать ассоциации.

2. ПРАВИЛА БЕРЕЖНОГО РАЗГОВОРА:
- Не перебивайте, даже если рассказчик отвлекается на детали быта.
- Спрашивайте про звуки, запахи, вывески, дворовые игры, соседей.
- Обязательно спросите согласие на публикацию и выбор статуса (имя или анонимно).

3. АТРИБУЦИЯ ФОТОГРАФИЙ:
- Зафиксируйте примерный год съемки и источник (семейный альбом).
- Опишите людей и фон на фотографии.

Проект локальной памяти «Место помнит» · Минск · 2026`;

    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Pamyatka_Intervyuera_Mesto_Pomnit.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-neutral-100">
      
      {/* Manifest (Slide 9 from PDF) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
          <GraduationCap className="w-4 h-4 text-white" />
          <span>Методический модуль платформы</span>
        </div>
        <h2 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
          От школьного проекта до местного архива
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl mt-2 font-sans">
          Платформа «Место помнит» спроектирована как инструмент исследовательской работы: от индивидуального школьного задания по краеведению до цифрового архива музея или библиотеки.
        </p>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadInterviewGuide}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать памятку интервьюера (TXT)</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-xs font-semibold border border-neutral-800 transition-all active:scale-95"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCheck className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{downloadSuccess ? 'Архив экспортирован' : 'Экспорт базы точек в JSON'}</span>
          </button>
        </div>
      </div>

      {/* 4 Spheres (Slide 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* 1. School */}
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base text-white">
            Школа: Краеведение и исследовательские задания
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Ученики изучают историю своей улицы или района, берут интервью у ветеранов и старожилов, готовят доклады для краеведческих конференций.
          </p>
        </div>

        {/* 2. Museum & Library */}
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base text-white">
            Музей или библиотека: Живой цифровой архив
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Дополнение традиционных экспозиций аудиозаписями очевидцев и сканами частных семейных фотоальбомов, которые не попадают в архивы.
          </p>
        </div>

        {/* 3. City / Town */}
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <Map className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base text-white">
            Город или село: Сохранение локальных историй
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Сохранение неофициальной топонимики и памяти («Труба», «дом-волна», «бабушка с семечками»), раскрывающих идентичность Минска.
          </p>
        </div>

        {/* 4. Family */}
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <Home className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base text-white">
            Семья: Запись рассказов старших родственников
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Молодые участники записывают воспоминания бабушек и дедушек о молодости, доме и соседях, сохраняя бережный цифровой след семьи.
          </p>
        </div>
      </div>

      {/* Guide details */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-white" />
          <span>Памятка по проведению бережного интервью</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-300">1. Контакт</span>
            <p className="text-neutral-400 leading-relaxed">
              Не включайте диктофон внезапно. Заварите чай, посмотрите старые альбомы, помогите человеку погрузиться в воспоминания.
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-300">2. Детали быта</span>
            <p className="text-neutral-400 leading-relaxed">
              Спрашивайте: «Какой запах стоял в той булочной?», «Какой звук издавал трамвай?», «В какие игры играли во дворе?».
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-300">3. Согласие</span>
            <p className="text-neutral-400 leading-relaxed">
              Всегда уточняйте, готов ли человек к публикации, или предпочитает остаться анонимным очевидцем.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
